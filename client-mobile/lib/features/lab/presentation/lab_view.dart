import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../../core/api/api_client.dart';
import '../../../core/socket/socket_manager.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import '../../tv/presentation/video_player_page.dart';

class LabView extends StatefulWidget {
  const LabView({super.key});

  @override
  State<LabView> createState() => _LabViewState();
}

class _LabViewState extends State<LabView> {
  List<dynamic> _categories = [];
  bool _isLoading = true;
  dynamic _activeBroadcast;

  @override
  void initState() {
    super.initState();
    _fetchLabData();
  }

  Future<void> _fetchLabData() async {
    try {
      final response = await context.read<ApiClient>().get('/lab/categories');
      setState(() {
        _categories = response.data;
        _isLoading = false;
      });
    } catch (e) {
      print('Failed to fetch lab data: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: StreamBuilder<List<dynamic>>(
        stream: context.read<SocketManager>().broadcastStreams,
        builder: (context, snapshot) {
          final streams = snapshot.data ?? [];
          _activeBroadcast = streams.isNotEmpty ? streams.first : null;

          return CustomScrollView(
            slivers: [
              // Premium AppBar
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
                      Icon(LucideIcons.flaskConical, color: AppColors.accentPrimary, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'THE LAB',
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
              ),
              // Hero Section
              SliverToBoxAdapter(
                child: Stack(
                  children: [
                    Container(
                      margin: const EdgeInsets.all(20),
                      padding: const EdgeInsets.all(40),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [AppColors.accentPrimary.withOpacity(0.1), Colors.transparent],
                        ),
                        borderRadius: BorderRadius.circular(32),
                        border: Border.all(color: AppColors.accentPrimary.withOpacity(0.2)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'BUILD. LEARN. APPLY.',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.accentPrimary, letterSpacing: 2),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'High-Performance\nR&D Environment',
                            style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white, height: 1.1),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            'Researching sovereign infrastructure and technical coherence through immersive building modules.',
                            style: TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.6),
                          ),
                        ],
                      ),
                    ),
                    if (_activeBroadcast != null) _buildLiveNotification(),
                  ],
                ),
              ),

              // Categories & Packages
              if (_isLoading)
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(60.0),
                    child: Center(child: CircularProgressIndicator(color: AppColors.accentPrimary)),
                  ),
                )
              else if (_categories.isEmpty)
                SliverToBoxAdapter(
                  child: Center(
                    child: Text('No lab modules available.', style: TextStyle(color: AppColors.textTertiary)),
                  ),
                )
              else
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      return _buildCategorySection(_categories[index]);
                    },
                    childCount: _categories.length,
                  ),
                ),

              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          );
        },
      ),
    );
  }

  Widget _buildLiveNotification() {
    return Positioned(
      bottom: 40,
      right: 40,
      child: Container(
        width: 240,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.bgSecondary.withOpacity(0.95),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.accentPrimary.withOpacity(0.4)),
          boxShadow: [
            BoxShadow(color: AppColors.accentPrimary.withOpacity(0.15), blurRadius: 20, offset: const Offset(0, 10)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                ),
                const SizedBox(width: 8),
                const Text(
                  'LIVE ON PANX TV',
                  style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 1),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              _activeBroadcast['title'] ?? 'Live Broadcast',
              style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800, height: 1.3),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 36,
              child: ElevatedButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => VideoPlayerPage(
                      streamUrl: _activeBroadcast['streamUrl'] ?? 'https://demo.unified-streaming.com/k8s/live/stable/scte35.isml/.m3u8',
                      title: _activeBroadcast['title'] ?? 'Live Broadcast',
                    ),
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accentPrimary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: EdgeInsets.zero,
                ),
                child: const Text('JOIN NOW', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategorySection(dynamic category) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 40, 24, 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(LucideIcons.layers, color: AppColors.accentPrimary, size: 18),
                      const SizedBox(width: 12),
                      Text(
                        category['title']?.toString().toUpperCase() ?? 'MODULE',
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.5),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    category['descriptor']?.toString().toUpperCase() ?? 'SYSTEM BRIEFING',
                    style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: AppColors.textTertiary, letterSpacing: 1.5),
                  ),
                ],
              ),
              Icon(LucideIcons.chevronRight, color: AppColors.textTertiary, size: 20),
            ],
          ),
        ),
        SizedBox(
          height: 340,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: (category['packages'] as List?)?.length ?? 0,
            itemBuilder: (context, index) {
              final package = category['packages'][index];
              return _buildPackageCard(package);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildPackageCard(dynamic package) {
    return Container(
      width: 280,
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.04),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              package['level']?.toString().toUpperCase() ?? 'OPERATOR',
              style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: AppColors.textTertiary),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            package['name'] ?? 'Core Module',
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -0.5),
          ),
          const SizedBox(height: 12),
          Text(
            package['description'] ?? 'Technical briefing and operational integration.',
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.5),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
          const Spacer(),
          Row(
            children: [
              Icon(LucideIcons.rocket, color: AppColors.accentPrimary, size: 14),
              const SizedBox(width: 8),
              Text(
                '${package['duration'] ?? '7D'} MISSION',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.textTertiary, letterSpacing: 0.5),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: AppColors.accentPrimary.withOpacity(0.3)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text(
                'ENROLL MODULE',
                style: TextStyle(color: AppColors.accentPrimary, fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
