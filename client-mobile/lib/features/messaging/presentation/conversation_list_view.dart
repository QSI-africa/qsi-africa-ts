import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/api/api_client.dart';
import '../../../core/socket/socket_manager.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import '../../auth/bloc/auth_bloc.dart';
import '../../auth/bloc/auth_state.dart';
import '../data/messaging_models.dart';
import 'chat_detail_page.dart';

class ConversationListView extends StatefulWidget {
  const ConversationListView({super.key});

  @override
  State<ConversationListView> createState() => _ConversationListViewState();
}

class _ConversationListViewState extends State<ConversationListView> {
  List<Conversation> _conversations = [];
  bool _isLoading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _fetchConversations();
  }

  Future<void> _fetchConversations() async {
    final authState = context.read<AuthBloc>().state;
    if (authState is! Authenticated) return;

    try {
      final response = await context.read<ApiClient>().get('/messaging/conversations?userId=${authState.user.id}');
      setState(() {
        _conversations = (response.data as List).map((c) => Conversation.fromJson(c)).toList();
        _isLoading = false;
      });
    } catch (e) {
      print('Failed to fetch conversations: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        // Premium AppBar
        SliverAppBar(
          expandedHeight: 120.0,
          floating: true,
          pinned: true,
          backgroundColor: AppColors.bgPrimary,
          flexibleSpace: FlexibleSpaceBar(
            titlePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            title: Row(
              children: [
                Icon(LucideIcons.messageSquare, color: AppColors.accentPrimary, size: 20),
                const SizedBox(width: 8),
                Text(
                  'INBOXES',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
          ),
        ),

        // Search Section
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.03),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: Row(
                children: [
                  Icon(LucideIcons.search, size: 18, color: AppColors.textTertiary),
                  Expanded(
                    child: TextField(
                      onChanged: (val) => setState(() => _searchQuery = val),
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'Search discussions...',
                        hintStyle: TextStyle(color: AppColors.textTertiary.withOpacity(0.5)),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),

        // Conversations List
        if (_isLoading)
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.all(60.0),
              child: Center(child: CircularProgressIndicator()),
            ),
          )
        else if (_conversations.isEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(60.0),
              child: Column(
                children: [
                  Icon(LucideIcons.inbox, size: 48, color: Colors.white.withOpacity(0.05)),
                  const SizedBox(height: 16),
                  Text(
                    'No Discussions Found',
                    style: TextStyle(color: AppColors.textTertiary, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final conv = _conversations[index];
                  if (_searchQuery.isNotEmpty && !conv.title.toLowerCase().contains(_searchQuery.toLowerCase())) {
                    return const SizedBox.shrink();
                  }
                  return _buildConversationCard(conv);
                },
                childCount: _conversations.length,
              ),
            ),
          ),

        const SliverToBoxAdapter(child: SizedBox(height: 100)),
      ],
    );
  }

  Widget _buildConversationCard(Conversation conv) {
    final isOnline = conv.status == 'online';
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => ChatDetailPage(conversation: conv)),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.bgSecondary,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Row(
          children: [
            Stack(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.03),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                  ),
                  child: Center(
                    child: Icon(
                      conv.type == 'module' ? LucideIcons.bot : (conv.type == 'operator' ? LucideIcons.user : LucideIcons.layers),
                      color: AppColors.accentPrimary,
                      size: 24,
                    ),
                  ),
                ),
                if (isOnline)
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: AppColors.accentPrimary,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.bgSecondary, width: 2),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        conv.title,
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                      ),
                      Text(
                        conv.timestamp,
                        style: TextStyle(fontSize: 10, color: AppColors.textTertiary, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    conv.lastMessage,
                    style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            if (conv.unreadCount > 0)
              Container(
                margin: const EdgeInsets.only(left: 12),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.accentPrimary,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  conv.unreadCount.toString(),
                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
