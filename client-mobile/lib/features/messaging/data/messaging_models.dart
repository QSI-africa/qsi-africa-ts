import 'package:equatable/equatable.dart';

class Conversation extends Equatable {
  final String id;
  final String title;
  final String lastMessage;
  final String timestamp;
  final String type; // 'module' | 'operator' | 'project'
  final int unreadCount;
  final String status; // 'online' | 'offline'

  const Conversation({
    required this.id,
    required this.title,
    required this.lastMessage,
    required this.timestamp,
    required this.type,
    required this.unreadCount,
    required this.status,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'] ?? '',
      title: json['title'] ?? 'Unknown',
      lastMessage: json['lastMessage'] ?? '',
      timestamp: json['timestamp'] ?? '',
      type: json['type'] ?? 'operator',
      unreadCount: json['unreadCount'] ?? 0,
      status: json['status'] ?? 'offline',
    );
  }

  @override
  List<Object?> get props => [id, title, lastMessage, timestamp, type, unreadCount, status];
}

class Message extends Equatable {
  final String id;
  final String text;
  final String senderId;
  final String senderType; // 'USER' | 'SYSTEM'
  final DateTime createdAt;

  const Message({
    required this.id,
    required this.text,
    required this.senderId,
    required this.senderType,
    required this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] ?? '',
      text: json['text'] ?? '',
      senderId: json['senderId'] ?? '',
      senderType: json['senderType'] ?? 'SYSTEM',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }

  @override
  List<Object?> get props => [id, text, senderId, senderType, createdAt];
}
