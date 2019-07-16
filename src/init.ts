// a simple http server
var srv = net.createServer(net.SocketType.TCP);
srv.listen(80, conn => {
  conn.on("receive", (sck, payload) => {
    print(payload);
    sck.send("<h1> Hello, NodeMcu.</h1>");
  });
});
