import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import 'video_player_page.dart';
import 'broadcast_page.dart';

class TvView extends StatefulWidget {
  const TvView({super.key});

  @override
  State<TvView> createState() => _TvViewState();
}

class _TvViewState extends State<TvView> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: StreamBuilder<List<dynamic>>(
        stream: context.read<SocketManager>().broadcastStreams,
        builder: (context, snapshot) {
          final streams = snapshot.data ?? [];
          final activeBroadcast = streams.isNotEmpty ? streams.first : null;

          return CustomScrollView(
            slivers: [
              // Premium App Bar
              SliverAppBar(
                expandedHeight: 120.0,
                floating: true,
                pinned: true,
                backgroundColor: AppColors.bgPrimary,
                leading: IconButton(
                  icon: Icon(LucideIcons.chevronLeft, color: AppColors.textSecondary),
                  onPressed: () => Navigator.pop(context),
                ),
                flexibleSpace: FlexibleSpaceBar(
                  titlePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  title: Row(
                    children: [
                      const SizedBox(width: 32),
                      Icon(LucideIcons.tv, color: AppColors.accentPrimary, size: 20),
                      const SizedBox(width: 8),
                      const Text(
                        'QSI TV',
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 2,
                        ),
                      ),
                    ],
                  ),
                ),
                actions: [
                  IconButton(
                    icon: Icon(LucideIcons.radio, size: 14, color: AppColors.accentPrimary),
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const BroadcastPage()),
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
              ),

              // Live Now Section
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSectionHeader('LIVE NOW', LucideIcons.activity),
                      const SizedBox(height: 16),
                      if (activeBroadcast != null)
                        _buildLiveCard(
                          context,
                          activeBroadcast['title'] ?? 'Live Strategic Sync',
                          'QSI Engineering Node • ${activeBroadcast['viewers'] ?? '0'} watching',
                          activeBroadcast['streamUrl'],
                        )
                      else
                        _buildEmptyLiveState(context),
                    ],
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.accentPrimary),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            color: AppColors.textTertiary,
            fontSize: 10,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyLiveState(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withOpacity(0.5),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        children: [
          Icon(LucideIcons.radioTower, color: AppColors.textTertiary.withOpacity(0.3), size: 48),
          const SizedBox(height: 16),
          const Text(
            'BROADCAST STANDBY',
            style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 1),
          ),
          const SizedBox(height: 8),
          Text(
            'No active nodes currently broadcasting from the field.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.textTertiary, fontSize: 12),
          ),
          const SizedBox(height: 24),
          OutlinedButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const BroadcastPage())),
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: AppColors.accentPrimary.withOpacity(0.3)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('START BROADCAST', style: TextStyle(color: AppColors.accentPrimary, fontSize: 11, fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  Widget _buildLiveCard(BuildContext context, String title, String subtitle, String? streamUrl) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => VideoPlayerPage(
            streamUrl: streamUrl ?? 'https://demo.unified-streaming.com/k8s/live/stable/scte35.isml/.m3u8',
            title: title,
          ),
        ),
      ),
      child: Container(
        height: 200,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          color: AppColors.bgSecondary,
          border: Border.all(color: AppColors.borderSubtle),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(4)),
                  child: const Text('LIVE', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                ),
                const Spacer(),
                Icon(LucideIcons.play, size: 48, color: AppColors.accentPrimary.withOpacity(0.1)),
              ],
            ),
            const Spacer(),
            Text(
              title,
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }
}
