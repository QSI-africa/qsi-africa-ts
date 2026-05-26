import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import '../bloc/logic_bloc.dart';
import '../bloc/logic_event.dart';
import '../bloc/logic_state.dart';
import '../data/chat_model.dart';

class ChatPage extends StatefulWidget {
  final String moduleName;
  const ChatPage({super.key, required this.moduleName});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();

  final Map<String, dynamic> _moduleDetails = {
    'infrastructure': {
      'title': 'Infrastructure AI',
      'icon': LucideIcons.layoutGrid,
      'endpoint': '/infrastructure',
      'slogan': 'Building coherence...',
    },
    'healing': {
      'title': 'Healing Assistant',
      'icon': LucideIcons.sparkles,
      'endpoint': '/healing-chat',
      'slogan': 'Guiding you...',
    },
    'vision': {
      'title': 'Vision Translator',
      'icon': LucideIcons.brain,
      'endpoint': '/vision',
      'slogan': 'Translate imagination...',
    },
  };

  @override
  void initState() {
    super.initState();
    context.read<LogicBloc>().add(FetchSuggestions(module: widget.moduleName));
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 300), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final details = _moduleDetails[widget.moduleName] ?? _moduleDetails['infrastructure'];

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(LucideIcons.chevronLeft, color: AppColors.textSecondary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.accentPrimary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(details['icon'], color: AppColors.accentPrimary, size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  details['title'],
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                ),
                Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(color: AppColors.accentPrimary, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 6),
                    const Text(
                      'SYNCHRONIZED',
                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: AppColors.accentPrimary, letterSpacing: 0.5),
                    ),
                  ],
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
          const SizedBox(width: 8),
        ],
        backgroundColor: AppColors.bgPrimary.withOpacity(0.8),
      ),
      body: BlocConsumer<LogicBloc, LogicState>(
        listener: (context, state) {
          if (state is LogicChatUpdated) {
            _scrollToBottom();
          }
        },
        builder: (context, state) {
          List<ChatMessage> messages = [];
          bool isTyping = false;
          List<dynamic> suggestions = [];

          if (state is LogicChatUpdated) {
            messages = state.messages;
            isTyping = state.isTyping;
            suggestions = state.suggestions;
          }

          return Column(
            children: [
              Expanded(
                child: Builder(
                  builder: (context) {
                    if (messages.isEmpty && state is! LogicLoading) {
                      return _buildWelcomeState(details);
                    }

                    return ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(24),
                      itemCount: messages.length + (isTyping ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index == messages.length) {
                          return _buildTypingIndicator();
                        }
                        return _buildChatBubble(messages[index]);
                      },
                    );
                  },
                ),
              ),

          // Strategic Actions Row
          if (suggestions.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: suggestions.map((s) {
                    final text = s is String ? s : (s['suggestion'] ?? s['title'] ?? 'Strategic Action');
                    return Padding(
                      padding: const EdgeInsets.only(right: 12),
                      child: _buildActionChip(text, LucideIcons.sparkles),
                    );
                  }).toList(),
                ),
              ),
            ),
              const SizedBox(height: 16),
              _buildInputArea(details['endpoint']),
            ],
          );
        },
      ),
    );
  }

  Widget _buildWelcomeState(Map<String, dynamic> details) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(details['icon'], size: 48, color: AppColors.accentPrimary.withOpacity(0.2)),
          const SizedBox(height: 16),
          const Text(
            'Operational initialization complete.',
            style: TextStyle(color: AppColors.textTertiary, fontSize: 12, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            details['slogan'],
            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildChatBubble(ChatMessage message) {
    final isUser = message.sender == MessageSender.user;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Column(
        crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
            decoration: BoxDecoration(
              color: isUser ? AppColors.accentPrimary : AppColors.bgSecondary,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(24),
                topRight: const Radius.circular(24),
                bottomLeft: Radius.circular(isUser ? 24 : 4),
                bottomRight: Radius.circular(isUser ? 4 : 24),
              ),
              boxShadow: isUser ? [
                BoxShadow(color: AppColors.accentPrimary.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 8)),
              ] : null,
              border: isUser ? null : Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Text(
              message.text,
              style: TextStyle(
                color: isUser ? Colors.white : AppColors.textPrimary,
                fontSize: 15,
                height: 1.5,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(bottom: 24.0, left: 4, right: 4),
            child: Text(
              DateFormat('HH:mm').format(message.timestamp),
              style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: AppColors.textTertiary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 24),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.bgSecondary,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.accentPrimary),
              ),
            ),
            const SizedBox(width: 12),
            const Text(
              'Synchronizing...',
              style: TextStyle(color: AppColors.textTertiary, fontSize: 12, fontStyle: FontStyle.italic),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputArea(String endpoint) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.bgSecondary.withOpacity(0.8),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 40, offset: const Offset(0, 10)),
          ],
        ),
        child: Row(
          children: [
            IconButton(
              icon: Icon(LucideIcons.paperclip, color: AppColors.textTertiary, size: 20),
              onPressed: () {},
            ),
            Expanded(
              child: TextField(
                controller: _messageController,
                maxLines: 4,
                minLines: 1,
                style: const TextStyle(color: Colors.white, fontSize: 15),
                decoration: InputDecoration(
                  hintText: 'Transmit message...',
                  hintStyle: TextStyle(color: Colors.white.withOpacity(0.2)),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 8),
                ),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: () {
                final text = _messageController.text.trim();
                if (text.isNotEmpty) {
                  HapticFeedback.mediumImpact();
                  context.read<LogicBloc>().add(MessageSent(text: text, endpoint: endpoint));
                  _messageController.clear();
                }
              },
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.accentPrimary,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: AppColors.accentPrimary.withOpacity(0.4), blurRadius: 15, offset: const Offset(0, 6)),
                  ],
                ),
                child: Icon(LucideIcons.send, color: Colors.white, size: 18),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionChip(String label, IconData icon) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        _messageController.text = label;
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.bgSecondary.withOpacity(0.5),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.borderSubtle),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: AppColors.accentPrimary),
            const SizedBox(width: 8),
            Text(
              label.toUpperCase(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 9,
                fontWeight: FontWeight.w900,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
