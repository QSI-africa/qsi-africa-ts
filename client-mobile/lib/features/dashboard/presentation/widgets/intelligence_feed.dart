import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:qsi_client_mobile/core/widgets/skeleton_loader.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';

class IntelligenceFeed extends StatefulWidget {
  const IntelligenceFeed({super.key});

  @override
  State<IntelligenceFeed> createState() => _IntelligenceFeedState();
}

class _IntelligenceFeedState extends State<IntelligenceFeed> {
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _simulateLoading();
  }

  Future<void> _simulateLoading() async {
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => _buildSkeletonItem(),
          childCount: 3,
        ),
      );
    }

    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) => _buildActualItem(index),
        childCount: 5,
      ),
    );
  }

  Widget _buildSkeletonItem() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withOpacity(0.5),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              SkeletonLoader(width: 32, height: 32, borderRadius: 16),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SkeletonLoader(width: 100, height: 12),
                  const SizedBox(height: 4),
                  SkeletonLoader(width: 60, height: 8),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          SkeletonLoader(width: double.infinity, height: 14),
          const SizedBox(height: 8),
          SkeletonLoader(width: 200, height: 14),
          const SizedBox(height: 24),
          SkeletonLoader(width: double.infinity, height: 160, borderRadius: 16),
        ],
      ),
    );
  }

  Widget _buildActualItem(int index) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withOpacity(0.5),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: AppColors.accentPrimary.withOpacity(0.1),
                child: Icon(LucideIcons.user, size: 16, color: AppColors.accentPrimary),
              ),
              const SizedBox(width: 12),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Sector Architect',
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '2 hours ago • Mobility Node',
                    style: TextStyle(color: AppColors.textTertiary, fontSize: 10, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              const Spacer(),
              Icon(LucideIcons.ellipsis, size: 20, color: AppColors.textTertiary),
            ],
          ),
          const SizedBox(height: 16),
          const Text(
            'New infrastructure deployment initiated in the North Sector. Hyper-mobility nodes are now operational.',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14, height: 1.5),
          ),
          const SizedBox(height: 20),
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: CachedNetworkImage(
              imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
              height: 160,
              width: double.infinity,
              fit: BoxFit.cover,
              placeholder: (context, url) => SkeletonLoader(height: 160, borderRadius: 16),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              _buildInteraction(LucideIcons.heart, '24'),
              const SizedBox(width: 24),
              _buildInteraction(LucideIcons.messageCircle, '8'),
              const Spacer(),
              Icon(LucideIcons.share2, size: 18, color: AppColors.textTertiary),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInteraction(IconData icon, String count) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.textTertiary),
        const SizedBox(width: 8),
        Text(
          count,
          style: const TextStyle(color: AppColors.textTertiary, fontSize: 12, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
