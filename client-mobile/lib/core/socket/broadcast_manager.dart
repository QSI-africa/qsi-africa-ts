import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'socket_manager.dart';

class BroadcastManager {
  final SocketManager socketManager;
  MediaStream? localStream;
  final Map<String, RTCPeerConnection> _peerConnections = {};

  BroadcastManager({required this.socketManager});

  Future<MediaStream> startLocalStream() async {
    final Map<String, dynamic> mediaConstraints = {
      'audio': true,
      'video': {
        'facingMode': 'user',
        'width': 1280,
        'height': 720,
      }
    };

    localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    return localStream!;
  }

  Future<void> startBroadcast(String roomId, String title) async {
    if (localStream == null) await startLocalStream();
    
    socketManager.socket?.emit('start-broadcast', [roomId, {'title': title}]);
    _setupSignalingListeners(roomId);
  }

  void _setupSignalingListeners(String roomId) {
    socketManager.socket?.on('viewer-joined', (data) async {
      final String viewerId = data['viewerId'];
      await _createPeerConnection(roomId, viewerId);
    });

    socketManager.socket?.on('answer', (data) async {
      final String senderUserId = data['senderUserId'];
      final pc = _peerConnections[senderUserId];
      if (pc != null) {
        await pc.setRemoteDescription(RTCSessionDescription(data['answer']['sdp'], data['answer']['type']));
      }
    });

    socketManager.socket?.on('ice-candidate', (data) async {
      final String senderUserId = data['senderUserId'];
      final pc = _peerConnections[senderUserId];
      if (pc != null) {
        await pc.addCandidate(RTCIceCandidate(
          data['candidate']['candidate'],
          data['candidate']['sdpMid'],
          data['candidate']['sdpMLineIndex'],
        ));
      }
    });

    socketManager.socket?.on('user-disconnected', (data) {
      final String socketId = data['socketId'];
      _peerConnections[socketId]?.close();
      _peerConnections.remove(socketId);
    });
  }

  Future<void> _createPeerConnection(String roomId, String viewerId) async {
    final Map<String, dynamic> configuration = {
      'iceServers': [
        {'urls': 'stun:stun1.l.google.com:19302'},
        {'urls': 'stun:stun2.l.google.com:19302'},
      ]
    };

    final pc = await createPeerConnection(configuration);
    _peerConnections[viewerId] = pc;

    localStream?.getTracks().forEach((track) {
      pc.addTrack(track, localStream!);
    });

    pc.onIceCandidate = (candidate) {
      socketManager.socket?.emit('ice-candidate', [
        {
          'targetUserId': viewerId,
          'candidate': {
            'candidate': candidate.candidate,
            'sdpMid': candidate.sdpMid,
            'sdpMLineIndex': candidate.sdpMLineIndex,
          }
        }
      ]);
    };

    final offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socketManager.socket?.emit('offer', [
      {
        'targetUserId': viewerId,
        'offer': {'sdp': offer.sdp, 'type': offer.type}
      }
    ]);
  }

  void stopBroadcast(String roomId) {
    localStream?.getTracks().forEach((track) => track.stop());
    localStream = null;
    
    _peerConnections.forEach((id, pc) => pc.close());
    _peerConnections.clear();
    
    socketManager.socket?.emit('stop-broadcast', roomId);
    socketManager.socket?.off('viewer-joined');
    socketManager.socket?.off('answer');
    socketManager.socket?.off('ice-candidate');
    socketManager.socket?.off('user-disconnected');
  }

  void toggleMute(bool isMuted) {
    localStream?.getAudioTracks().forEach((track) {
      track.enabled = !isMuted;
    });
  }

  void toggleVideo(bool isVideoOff) {
    localStream?.getVideoTracks().forEach((track) {
      track.enabled = !isVideoOff;
    });
  }
}
