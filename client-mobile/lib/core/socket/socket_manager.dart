import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../constants/api_constants.dart';

class SocketManager {
  io.Socket? _socket;
  final _broadcastController = StreamController<List<dynamic>>.broadcast();

  Stream<List<dynamic>> get broadcastStreams => _broadcastController.stream;
  io.Socket? get socket => _socket;

  void connect({String? token}) {
    if (_socket?.connected == true) return;

    _socket = io.io(
      ApiConstants.baseUrl.replaceAll('/api', ''), // Remove /api for socket connection base
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .setPath('/api/socket.io')
          .setAuth({'token': token})
          .enableForceNew()
          .build(),
    );

    _socket!.onConnect((_) {
      print('Connected to Socket.IO signaling server');
      _socket!.emit('get-active-broadcasts');
    });

    _socket!.on('broadcast-list-updated', (data) {
      if (data is List) {
        _broadcastController.add(data);
      }
    });

    _socket!.onConnectError((err) => print('Socket connection error: $err'));
    _socket!.onDisconnect((_) => print('Socket disconnected'));
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }

  void emit(String event, dynamic data) {
    _socket?.emit(event, data);
  }

  void dispose() {
    disconnect();
    _broadcastController.close();
  }
}
