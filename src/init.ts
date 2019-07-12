var udpSocket = net.createUDPSocket();
udpSocket.listen(5000);
udpSocket.on("receive", (s, data, port, ip) => {
  print(`received '${data}' from ${ip}:${port}`);
  s.send(port, ip, "echo: " + data);
});
var [port, ip] = udpSocket.getaddr();
print(`local UDP socket address / port: ${ip}:${port}`);
udpSocket.dns("www.nodemcu.com", (_conn, ip) => print(ip));
print("aaa".length);
