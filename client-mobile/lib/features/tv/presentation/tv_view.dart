import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import 'video_player_page.dart';
import 'broadcast_page.dart';

class TvView extends StatelessWidget {
  const TvView({super.key});

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        // Premium App Bar
        SliverAppBar(
          expandedHeight: 120.0,
          floating: true,
          pinned: true,
          backgroundColor: AppColors.bgPrimary,
          flexibleSpace: FlexibleSpaceBar(
            titlePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            title: Row(
              children: [
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
                _buildLiveCard(
                  context,
                  'Sovereign Infrastructure Sync',
                  'Engineering Team • 422 viewers',
                  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
                ),
              ],
            ),
          ),
        ),

        // Categories
        SliverToBoxAdapter(
          child: SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _buildCategoryChip('ALL NODES', true),
                _buildCategoryChip('ENGINEERING', false),
                _buildCategoryChip('CULTURE', false),
                _buildCategoryChip('STRATEGY', false),
              ],
            ),
          ),
        ),

        // Lab Tracks (Previously missing method implemented)
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildSectionHeader('LAB TRACKS', LucideIcons.beaker),
                    Text(
                      'SEE ALL',
                      style: TextStyle(color: AppColors.accentPrimary, fontSize: 10, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildLabTrack(
                  context,
                  'Sovereign Cloud',
                  'Module 1: Infrastructure',
                  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
                ),
                _buildLabTrack(
                  context,
                  'Mobility Nodes',
                  'Module 4: Urban Sync',
                  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800',
                ),
                _buildLabTrack(
                  context,
                  'Renaissance Art',
                  'Module 2: Creative AI',
                  'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=800',
                ),
              ],
            ),
          ),
        ),

        // Broadcast Archive
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: _buildSectionHeader('BROADCAST ARCHIVE', LucideIcons.signal),
          ),
        ),

        SliverPadding(
          padding: const EdgeInsets.all(20),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 0.8,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) => _buildArchiveCard(
                context,
                'Regional Summit ${2026 - index}',
                'Strategy Node',
                'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=400',
              ),
              childCount: 4,
            ),
          ),
        ),

        const SliverToBoxAdapter(child: SizedBox(height: 100)),
      ],
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

  Widget _buildLiveCard(BuildContext context, String title, String subtitle, String imageUrl) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => VideoPlayerPage(
            streamUrl: 'https://flutter.github.io/assets-for-api-docs/assets/videos/butterfly.mp4',
            title: title,
          ),
        ),
      ),
      child: Container(
        height: 200,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.borderSubtle),
          image: DecorationImage(
            image: NetworkImage(imageUrl),
            fit: BoxFit.cover,
          ),
        ),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Colors.transparent, Colors.black.withOpacity(0.8)],
            ),
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
                  Icon(LucideIcons.play, size: 48, color: Colors.white.withOpacity(0.05)),
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
      ),
    );
  }

  Widget _buildLabTrack(BuildContext context, String title, String module, String imageUrl) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: CachedNetworkImage(
              imageUrl: imageUrl,
              width: 64,
              height: 64,
              fit: BoxFit.cover,
              errorWidget: (context, url, error) => Icon(LucideIcons.imageMinus, color: AppColors.textTertiary),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  module,
                  style: const TextStyle(color: AppColors.textTertiary, fontSize: 10, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          Icon(LucideIcons.circlePlay, color: AppColors.accentPrimary, size: 24),
        ],
      ),
    );
  }

  Widget _buildArchiveCard(BuildContext context, String title, String node, String imageUrl) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              image: DecorationImage(image: NetworkImage(imageUrl), fit: BoxFit.cover),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Row(
          children: [
            Icon(LucideIcons.user, size: 12, color: AppColors.textTertiary),
            const SizedBox(width: 4),
            Text(
              node,
              style: const TextStyle(color: AppColors.textTertiary, fontSize: 10, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCategoryChip(String label, bool isSelected) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: isSelected ? AppColors.accentPrimary : AppColors.bgSecondary,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isSelected ? AppColors.accentPrimary : AppColors.borderSubtle),
      ),
      alignment: Alignment.center,
      child: Text(
        label,
        style: TextStyle(
          color: isSelected ? Colors.black : AppColors.textSecondary,
          fontSize: 10,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}
