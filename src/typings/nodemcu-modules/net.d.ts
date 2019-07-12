/** @noSelf */
declare namespace net {
  const TCP = 1;
  const UDP = 2;

  type SocketType = typeof TCP | typeof UDP;
  type EventCallback<T> = (this: void, sck: T) => void;
  type DnsEventCallback<T> = (this: void, sck: T, ip: string) => void;
  type ErrorEventCallback<T> = (this: void, sck: T, err: number) => void;
  type TCPReceiveEventCallback = (
    this: void,
    sck: Socket,
    data: string
  ) => void;
  type UDPReceiveEventCallback = (
    this: void,
    sck: UdpSocket,
    data: string,
    port: number,
    ip: string
  ) => void;

  /**
   * Creates a client.
   * @param type `net.TCP` (default) or `net.UDP`
   * @param secure 1 for encrypted, 0 for plain (default)
   * ### Attention
   * This will change in upcoming releases so that `net.createConnection`
   * will always create an unencrypted TCP connection.
   *
   * There's no such thing as a UDP _connection_ because UDP is connection*less*.
   * Thus no connection `type` parameter should be required.
   * For UDP use [net.createUDPSocket()](#netcreateudpsocket) instead.
   * To create *secure* connections use [tls.createConnection()](tls.md#tlscreateconnection) instead.
   * @returns
   * - for `net.TCP` - net.socket sub module
   * - for `net.UDP` - net.udpsocket sub module
   * - for `net.TCP` with `secure` - tls.socket sub module
   * @example
   * net.createConnection(net.TCP, 0)
   * @todo tls socket with secure
   */
  function createConnection(type?: typeof TCP, secure?: 0 | 1): Socket;

  /**
   * Creates a server.
   *
   * ### Attention
   * The `type` parameter will be removed in upcoming releases so that `net.createServer`
   * will always create a TCP-based server. For UDP use net.createUDPSocket() instead.
   *
   * @param type `net.TCP` (default) or `net.UDP`
   * @param timeout for a TCP server timeout is 1~28'800 seconds,
   * 30 sec by default (for an inactive client to be disconnected)
   */
  function createServer(type?: typeof TCP, timeout?: number): Server;

  /**
   * Creates an UDP socket.
   */
  function createUDPSocket(): UdpSocket;

  /**
   * Join multicast group.
   * @param ifIp string containing the interface ip to join the multicast group.
   * "any" or "" affects all interfaces.
   * @param multicastIp of the group to join
   */
  function multicastJoin(ifIp: string, multicastIp: string): void;

  /**
   * Leave multicast group.
   * @param ifIp string containing the interface ip to leave the multicast group.
   * "any" or "" affects all interfaces.
   * @param multicastIp of the group to leave
   */
  function multicastLeave(ifIp: string, multicastIp: string): void;

  interface Server {
    /**
     * Closes the server.
     * @example
     * // creates a server
     * const sv = net.createServer(net.TCP, 30)
     * // closes the server
     * sv.close()
     */
    close(): void;
    /**
     * Listen on port from IP address.
     * @param port port number, can be omitted (random port will be chosen)
     * @param ip IP address string, can be omitted
     * @param connectionHandler callback function, pass to caller function as param if a connection is created successfully
     * @example
     * // server listens on 80, if data received, print data to console and send "hello world" back to caller
     * // 30s time out for a inactive client
     * var sv = net.createServer(net.TCP, 30);
     *
     * function receiver(this: void, sck: net.Socket, data: string) {
     *   print(data);
     *   sck.close();
     * }
     *
     * if (sv) {
     *   sv.listen(80, conn => {
     *     conn.on("receive", receiver);
     *     conn.send("hello world");
     *   });
     * }
     */
    listen(connectionHandler: EventCallback<this>): void;
    listen(ip: string, connectionHandler: EventCallback<this>): void;
    listen(port: number, connectionHandler: EventCallback<this>): void;
    listen(
      port: number,
      ip: string,
      connectionHandler: EventCallback<this>
    ): void;

    /**
     * Returns server local address/port.
     * @returns `port`, `ip` (or `undefined`, `undefined` if not listening)
     * @tupleReturn
     */
    getaddr(): [number, string] | [undefined, undefined];
  }

  interface Socket {
    /**
     * Closes socket.
     */
    close(): void;

    /**
     * Connect to a remote server.
     * @param port port number
     * @param host IP address or domain name string
     */
    connect(port: number, host: string): void;

    /**
     * Provides DNS resolution for a hostname.
     * @param domain domain name
     * @param cb callback function.
     * The first parameter is the socket, the second parameter is the IP address as a string.
     * @example
     * var sck = net.createConnection(net.TCP, 0);
     * sck.dns("www.nodemcu.com", (conn, ip) => print(ip));
     */
    dns(domain: string, cb: DnsEventCallback<this>): void;

    /**
     * Retrieve port and ip of remote peer.
     * @returns `port`, `ip` (or `undefined`, `undefined` if not connected)
     * @tupleReturn
     */
    getpeer(): [number, string] | [undefined, undefined];

    /**
     * Retrieve local port and ip of socket.
     * @returns `port`, `ip` (or `undefined`, `undefined` if not connected)
     * @tupleReturn
     */
    getaddr(): [number, string] | [undefined, undefined];

    /**
     * Throttle data reception by placing a request to block the TCP receive function.
     * This request is not effective immediately, Espressif recommends to call it while
     * reserving 5*1460 bytes of memory.
     */
    hold(): void;

    /**
     * Register callback functions for specific events.
     *
     * @param event  string, which can be `connection`, `reconnection`, `disconnection`,
     * `receive` or `sent`
     * @param cb callback function. Can be `null` to remove callback.
     * The first parameter of callback is the socket.
     *
     * * If event is "disconnection" or "reconnection", the second parameter is error code.
     * If reconnection event is specified, disconnection receives only "normal close" events.
     *
     * Otherwise, all connection errors (with normal close) passed to disconnection event.
     *
     * @example
     * var srv = net.createConnection(net.TCP, 0);
     * srv.on("receive", function(sck, c) {
     *   print(c);
     * });
     * // Wait for connection before sending.
     * srv.on("connection", function(sck) {
     *   // 'Connection: close' rather than 'Connection: keep-alive' to have server
     *   // initiate a close of the connection after final response (frees memory
     *   // earlier here), https://tools.ietf.org/html/rfc7230#section-6.6
     *   sck.send(
     *     "GET /get HTTP/1.1\r\nHost: httpbin.org\r\nConnection: close\r\nAccept: *\/*\r\n\r\n"
     *   );
     * });
     * srv.connect(80, "httpbin.org");
     */
    on(event: "connection", cb: EventCallback<this> | null): void;
    on(event: "reconnection", cb: ErrorEventCallback<this> | null): void;
    on(event: "disconnection", cb: ErrorEventCallback<this> | null): void;
    on(event: "sent", cb: EventCallback<this> | null): void;
    /**
     * Register callback functions for receive data event.
     *
     * ### Note
     * The receive event is fired for every network frame! Hence,
     * if the data sent to the device exceeds 1460 bytes (derived from Ethernet frame size)
     * it will fire more than once. There may be other situations where incoming data is split
     * across multiple frames (e.g. HTTP POST with multipart/form-data).
     * You need to manually buffer the data and find means to determine if all data was received.
     * @example
     * var sck = net.createConnection();
     * var buffer: null | string = null;
     *
     * sck.on("receive", function(conn, c) {
     *   if (buffer == null) {
     *     buffer = c;
     *   } else {
     *     buffer = buffer + c;
     *   }
     * });
     */
    on(event: "receive", cb: TCPReceiveEventCallback | null): void;

    /**
     * Sends data to remote peer.
     * ### Note
     * Multiple consecutive `send()` calls aren't guaranteed to work (and often don't)
     * as network requests are treated as separate tasks by the SDK.
     * Instead, subscribe to the "sent" event on the socket and send additional
     * data (or close) in that callback. See [#730](https://github.com/nodemcu/nodemcu-firmware/issues/730#issuecomment-154241161) for details.
     * @example
     * var srv = net.createServer(net.TCP);
     *
     * function receiver(this: void, sck: net.Socket, data: string) {
     *   // let response: string[] | undefined = [];
     *
     *   // if you're sending back HTML over HTTP you'll want something like this instead
     *   const response = [
     *     "HTTP/1.0 200 OK\r\nServer: NodeMCU on ESP8266\r\nContent-Type: text/html\r\n\r\n"
     *   ];
     *
     *   response[response.length] = "lots of data";
     *   response[response.length] = "even more data";
     *   response[response.length] = "e.g. content read from a file";
     *
     *   // sends and removes the first element from the 'response' table
     *   function send(this: void, localSocket: net.Socket) {
     *     if (response.length > 0) {
     *       localSocket.send(response.shift()!);
     *     } else {
     *       localSocket.close();
     *     }
     *   }
     *
     *   // triggers the send() function again once the first chunk of data was sent
     *   sck.on("sent", send);
     *
     *   send(sck);
     * }
     *
     * srv.listen(80, conn => {
     *   conn.on("receive", receiver);
     * });
     * @param data data in string which will be sent to server
     * @param sentCb callback function for sending string
     */
    send(data: string, sentCb?: EventCallback<this>): void;

    /**
     * Retrieves Time-To-Live value on socket.
     * @returns current ttl value
     */
    ttl(): number;
    /**
     * Changes Time-To-Live value on socket.
     * @param ttl new time-to-live value
     * @returns new ttl value
     * @example
     * var sk = net.createConnection(net.TCP, 0);
     * sk.connect(80, '192.168.1.1');
     * sk.ttl(1) // restrict frames to single subnet
     */
    ttl(ttl: number): number;

    /**
     * Unblock TCP receiving data by revocation of a preceding `hold()`.
     */
    unhold(): void;
  }

  /**
   * Remember that in contrast to TCP [UDP](https://en.wikipedia.org/wiki/User_Datagram_Protocol) is connectionless.
   * Therefore, there is a minor but natural mismatch as for TCP/UDP functions in this module.
   * While you would call [net.createConnection()](#netcreateconnection) for TCP
   * it is [net.createUDPSocket()](#netcreateudpsocket) for UDP.
   *
   * Other points worth noting:
   *
   * - UDP sockets do not have a connection callback for the [`listen`](#netudpsocketlisten) function.
   * - UDP sockets do not have a `connect` function. Remote IP and port thus need to be defined in [`send()`](#netudpsocketsend).
   * - UDP socket's `receive` callback receives port/ip after the `data` argument.
   */
  interface UdpSocket {
    /**
     * Closes socket.
     */
    close(): void;

    /**
     * Listen on port from IP address.
     * @param port port number, can be omitted (random port will be chosen)
     * @param ip IP address string, can be omitted
     */
    listen(): void;
    listen(ip: string): void;
    listen(port: number): void;
    listen(port: number, ip: string): void;

    /**
     * Register callback functions for specific events.
     *
     * @param event string, which can be `receive` or `sent` or `dns`
     * @param cb callback function. Can be `undefined` to remove callback.
     */
    on(event: "sent", cb: EventCallback<this> | null): void;
    on(event: "receive", cb: UDPReceiveEventCallback | null): void;
    on(event: "dns", cb: DnsEventCallback<this> | null): void;

    /**
     * Sends data to specific remote peer.
     * @param port remote socket port
     * @param ip remote socket IP
     * @param data the payload to send
     * @example
     * var udpSocket = net.createUDPSocket();
     * udpSocket.listen(5000);
     * udpSocket.on("receive", (s, data, port, ip) => {
     *   print(`received '${data}' from ${ip}:${port}`);
     *   s.send(port, ip, "echo: " + data);
     * });
     * var [port, ip] = udpSocket.getaddr();
     * print(`local UDP socket address / port: ${ip}:${port}`);
     */
    send(port: number, ip: string, data: string): void;

    /**
     * Provides DNS resolution for a hostname.
     * @param domain domain name
     * @param cb callback function.
     * The first parameter is the socket, the second parameter is the IP address as a string.
     * @example
     * var sck = net.createConnection(net.TCP, 0);
     * sck.dns("www.nodemcu.com", (conn, ip) => print(ip));
     */
    dns(domain: string, cb: DnsEventCallback<this>): void;

    /**
     * Retrieve local port and ip of socket.
     * @returns `port`, `ip` (or `undefined`, `undefined` if not connected)
     * @tupleReturn
     */
    getaddr(): [number, string] | [undefined, undefined];

    /**
     * Retrieves Time-To-Live value on socket.
     * @returns current ttl value
     */
    ttl(): number;
    /**
     * Changes Time-To-Live value on socket.
     * @param ttl new time-to-live value
     * @returns new ttl value
     * @example
     * var sk = net.createConnection(net.TCP, 0);
     * sk.connect(80, '192.168.1.1');
     * sk.ttl(1) // restrict frames to single subnet
     */
    ttl(ttl: number): number;
  }

  namespace dns {
    /**
     * Gets the IP address of the DNS server used to resolve hostnames.
     * @param dnsIndex which DNS server to get (range 0~1)
     * @returns IP address (string) of DNS server
     * @example
     * print(net.dns.getdnsserver(0)); // 208.67.222.222
     * print(net.dns.getdnsserver(1)); // nil
     *
     * net.dns.setdnsserver("8.8.8.8", 0);
     * net.dns.setdnsserver("192.168.1.252", 1);
     *
     * print(net.dns.getdnsserver(0)); // 8.8.8.8
     * print(net.dns.getdnsserver(1)); // 192.168.1.252
     * @see net.dns.setdnsserver()
     */
    function getdnsserver(dnsIndex: 0 | 1): string;

    /**
     * Resolve a hostname to an IP address.
     * Doesn't require a socket like [`net.socket.dns()`](#netsocketdns).
     *
     * @param host hostname to resolve
     * @param cb callback called when the name was resolved.
     * @example
     * net.dns.resolve("www.google.com", (sk, ip) => {
     *   if (ip == null) print("DNS fail!");
     *   else print(ip);
     * });
     * @see net.Socket.dns()
     */
    function resolve(host: string, cb: DnsEventCallback<null>): void;

    /**
     * Sets the IP of the DNS server used to resolve hostnames.
     * Default: resolver1.opendns.com (208.67.222.222).
     * You can specify up to 2 DNS servers.
     *
     * @param dnsIpAddr IP address of a DNS server
     * @param dnsIndex which DNS server to set (range 0~1). Hence, it supports max. 2 servers.
     * @see net.dns.getdnsserver()
     */
    function setdnsserver(dnsIpAddr:string, dnsIndex: 0|1):void;
  }
}
