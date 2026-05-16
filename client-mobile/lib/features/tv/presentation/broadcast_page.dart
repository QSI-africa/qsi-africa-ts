import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import '../../../core/socket/broadcast_manager.dart';
import '../../../core/socket/socket_manager.dart';

class BroadcastPage extends StatefulWidget {
  const BroadcastPage({super.key});

  @override
  State<BroadcastPage> createState() => _BroadcastPageState();
}

class _BroadcastPageState extends State<BroadcastPage> {
  late BroadcastManager _broadcastManager;
  final _localRenderer = RTCVideoRenderer();
  bool _isBroadcasting = false;
  bool _isMuted = false;
  bool _isVideoOff = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _broadcastManager = BroadcastManager(socketManager: context.read<SocketManager>());
    _initialize();
  }

  Future<void> _initialize() async {
    await _localRenderer.initialize();
    await _broadcastManager.startLocalStream();
    if (mounted) {
      setState(() {
        _localRenderer.srcObject = _broadcastManager.localStream;
      });
    }
  }

  @override
  void dispose() {
    _localRenderer.dispose();
    _broadcastManager.stopBroadcast('test-room');
    super.dispose();
  }

  void _toggleBroadcast() {
    if (_isBroadcasting) {
      _broadcastManager.stopBroadcast('test-room');
    } else {
      _broadcastManager.startBroadcast('test-room', 'Live Strategy Session');
    }
    setState(() => _isBroadcasting = !_isBroadcasting);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Video View
          Center(
            child: _isVideoOff
                ? Container(
                    color: AppColors.bgSecondary,
                    child: Center(
                      child: Icon(LucideIcons.radio, size: 64, color: AppColors.accentPrimary.withOpacity(0.3)),
                    ),
                  )
                : RTCVideoView(_localRenderer, mirror: true, objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover),
          ),

          // Top Bar
          Positioned(
            top: 60,
            left: 20,
            right: 20,
            child: Row(
              children: [
                IconButton(
                  icon: Icon(LucideIcons.chevronLeft, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                ),
                const Spacer(),
                if (_isBroadcasting)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        const CircleAvatar(radius: 3, backgroundColor: Colors.white),
                        const SizedBox(width: 8),
                        const Text('LIVE', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
              ],
            ),
          ),

          // Bottom Controls
          Positioned(
            bottom: 40,
            left: 20,
            right: 20,
            child: Column(
              children: [
                // Viewers Count (Example)
                if (_isBroadcasting)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white.withOpacity(0.1)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(LucideIcons.eye, color: Colors.white, size: 14),
                        const SizedBox(width: 8),
                        const Text('1.2k Viewers', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildControlButton(
                      icon: _isMuted ? LucideIcons.micOff : LucideIcons.mic,
                      onPressed: () {
                        setState(() => _isMuted = !_isMuted);
                        _broadcastManager.toggleMute(_isMuted);
                      },
                      isActive: !_isMuted,
                    ),
                    GestureDetector(
                      onTap: _toggleBroadcast,
                      child: Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          color: _isBroadcasting ? Colors.red : AppColors.accentPrimary,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: (_isBroadcasting ? Colors.red : AppColors.accentPrimary).withOpacity(0.4),
                              blurRadius: 20,
                            ),
                          ],
                        ),
                        child: Icon(_isBroadcasting ? LucideIcons.circleStop : LucideIcons.radio, size: 28, color: Colors.white),
                      ),
                    ),
                    _buildControlButton(
                      icon: _isVideoOff ? LucideIcons.videoOff : LucideIcons.video,
                      onPressed: () {
                        setState(() => _isVideoOff = !_isVideoOff);
                        _broadcastManager.toggleVideo(_isVideoOff);
                      },
                      isActive: !_isVideoOff,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton({required IconData icon, required VoidCallback onPressed, required bool isActive}) {
    return IconButton(
      icon: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isActive ? Colors.white.withOpacity(0.1) : Colors.red.withOpacity(0.2),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: Colors.white, size: 24),
      ),
      onPressed: onPressed,
    );
  }
}
