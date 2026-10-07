/**
 * netlify/functions/api.js - Serverless Function tích hợp Rate Limiting Chống DoS
 * Triển khai trực tiếp trên hạ tầng đám mây Netlify
 * 
 * Kỹ thuật Rate Limiting (In-Memory Map trong RAM):
 * - Bước 1: Tạo Map trong RAM lưu địa chỉ IP và số lần truy cập.
 * - Bước 2: Middleware kiểm tra chu kỳ 10 giây.
 * - Bước 3: Nếu gọi quá 5 lần trong 10 giây, lập tức trả về mã lỗi 429 Too Many Requests.
 */

// BƯỚC 1: Map trong RAM lưu IP client
const ipMap = new Map();
const WINDOW_MS = 10 * 1000; // 10 giây
const MAX_REQUESTS = 5;      // Tối đa 5 requests

exports.handler = async (event, context) => {
  // Lấy IP client từ headers của Netlify CDN
  const clientIp = 
    event.headers["x-nf-client-connection-ip"] ||
    event.headers["client-ip"] ||
    (event.headers["x-forwarded-for"] ? event.headers["x-forwarded-for"].split(",")[0].trim() : "127.0.0.1");

  const now = Date.now();
  const record = ipMap.get(clientIp);

  // BƯỚC 2: Kiểm tra thời gian chu kỳ
  if (!record || (now - record.startTime > WINDOW_MS)) {
    // Reset số đếm về 1 khi quá 10 giây hoặc IP mới
    ipMap.set(clientIp, { count: 1, startTime: now });
  } else {
    // Tăng số đếm lên 1 nếu vẫn trong 10 giây
    record.count += 1;

    // BƯỚC 3: Chặn nếu vượt quá 5 lần
    if (record.count > MAX_REQUESTS) {
      const remainingSec = Math.ceil((WINDOW_MS - (now - record.startTime)) / 1000);
      return {
        statusCode: 429,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Retry-After": String(remainingSec),
          "X-RateLimit-Limit": String(MAX_REQUESTS),
          "X-RateLimit-Remaining": "0"
        },
        body: JSON.stringify({
          status: 429,
          error: "Too Many Requests",
          message: `PHÒNG THỦ DoS: Bạn đã gửi ${record.count}/${MAX_REQUESTS} requests trong 10s! Vui lòng chờ ${remainingSec}s trước khi gửi tiếp.`,
          retry_after_seconds: remainingSec,
          client_ip: clientIp
        })
      };
    }
  }

  const currentCount = ipMap.get(clientIp).count;
  const remaining = Math.max(0, MAX_REQUESTS - currentCount);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-RateLimit-Limit": String(MAX_REQUESTS),
      "X-RateLimit-Remaining": String(remaining)
    },
    body: JSON.stringify({
      status: 200,
      message: "OK - Request thành công",
      request_count: currentCount,
      limit: MAX_REQUESTS,
      remaining: remaining,
      client_ip: clientIp
    })
  };
};

