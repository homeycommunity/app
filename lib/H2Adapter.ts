import http2 from "http2-wrapper";

export const http2Transport = {
  request: function request(options: any, handleResponse: any) {
    const req = http2.request(options, handleResponse);
    setImmediate(() => {
      // Remove the axios action `socket.setKeepAlive` because the HTTP/2 sockets should not be directly manipulated
      const listeners = req.listeners("socket");
      if (listeners.length) req.removeListener("socket", listeners[0] as any);
    });
    return req;
  },
};
