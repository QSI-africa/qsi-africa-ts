import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import '../../auth/bloc/auth_bloc.dart';
import '../../auth/bloc/auth_state.dart';
import '../data/messaging_models.dart';

class ChatDetailPage extends StatefulWidget {
  final Conversation conversation;

  const ChatDetailPage({super.key, required this.conversation});

  @override
  State<ChatDetailPage> createState() => _ChatDetailPageState();
}

class _ChatDetailPageState extends State<ChatDetailPage> {
  final List<Message> _messages = [];
  bool _isLoading = true;
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _fetchMessages();
    _messageController.addListener(() {
      if (mounted) setState(() {});
    });
  }

  Future<void> _fetchMessages() async {
    try {
      final response = await context.read<ApiClient>().get('/messaging/conversations/${widget.conversation.id}/messages');
      setState(() {
        _messages.clear();
        _messages.addAll((response.data as List).map((m) => Message.fromJson(m)).toList());
        _isLoading = false;
      });
      _scrollToBottom();
    } catch (e) {
      print('Failed to fetch messages: $e');
      setState(() => _isLoading = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    final authState = context.read<AuthBloc>().state;
    if (authState is! Authenticated) return;

    _messageController.clear();

    try {
      final response = await context.read<ApiClient>().post(
        '/messaging/conversations/${widget.conversation.id}/messages',
        data: {
          'senderId': authState.user.id,
          'senderType': 'USER',
          'text': text,
        },
      );

      setState(() {
        _messages.add(Message.fromJson(response.data));
      });
      _scrollToBottom();
    } catch (e) {
      print('Failed to send message: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(LucideIcons.chevronLeft, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Icon(
                  widget.conversation.type == 'module' ? LucideIcons.bot : LucideIcons.user,
                  color: AppColors.accentPrimary,
                  size: 18,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.conversation.title,
                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800),
                ),
                Text(
                  widget.conversation.status.toUpperCase(),
                  style: TextStyle(
                    color: widget.conversation.status == 'online' ? AppColors.accentPrimary : AppColors.textTertiary,
                    fontSize: 8,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(LucideIcons.info, color: AppColors.textTertiary, size: 20),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(24),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final msg = _messages[index];
                      final isMe = msg.senderType == 'USER';
                      return _buildMessageBubble(msg, isMe);
                    },
                  ),
          ),
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(Message msg, bool isMe) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 20),
        child: Column(
          crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            Container(
              constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              decoration: BoxDecoration(
                color: isMe ? AppColors.accentPrimary : Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(20),
                  topRight: const Radius.circular(20),
                  bottomLeft: Radius.circular(isMe ? 20 : 4),
                  bottomRight: Radius.circular(isMe ? 4 : 20),
                ),
                border: isMe ? null : Border.all(color: Colors.white.withOpacity(0.08)),
                boxShadow: isMe ? [
                  BoxShadow(color: AppColors.accentPrimary.withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 5)),
                ] : null,
              ),
              child: Text(
                msg.text,
                style: TextStyle(
                  color: isMe ? Colors.white : Colors.white.withOpacity(0.9),
                  fontSize: 14,
                  height: 1.5,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              DateFormat('HH:mm').format(msg.createdAt),
              style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.white.withOpacity(0.2)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: EdgeInsets.fromLTRB(20, 16, 20, 16 + MediaQuery.of(context).padding.bottom),
      decoration: BoxDecoration(
        color: AppColors.bgPrimary,
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06))),
      ),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.03),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Row(
          children: [
            IconButton(
              icon: Icon(LucideIcons.paperclip, size: 20, color: AppColors.textTertiary),
              onPressed: () {},
            ),
            Expanded(
              child: TextField(
                controller: _messageController,
                maxLines: 4,
                minLines: 1,
                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500),
                decoration: const InputDecoration(
                  hintText: 'Type secure message...',
                  hintStyle: TextStyle(color: AppColors.textTertiary, fontSize: 13),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 12, horizontal: 12),
                ),
              ),
            ),
            IconButton(
              icon: Icon(
                LucideIcons.send,
                size: 20,
                color: _messageController.text.isNotEmpty ? AppColors.accentPrimary : AppColors.textTertiary,
              ),
              onPressed: _sendMessage,
            ),
          ],
        ),
      ),
    );
  }
}
