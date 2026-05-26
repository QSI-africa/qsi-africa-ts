import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:qsi_client_mobile/core/api/api_client.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';

class MobilityView extends StatefulWidget {
  const MobilityView({super.key});

  @override
  State<MobilityView> createState() => _MobilityViewState();
}

class _MobilityViewState extends State<MobilityView> {
  bool _isLoading = true;
  List<dynamic> _broadcasts = [];
  List<dynamic> _myVisits = [];

  @override
  void initState() {
    super.initState();
    _fetchMobilityData();
  }

  Future<void> _fetchMobilityData() async {
    try {
      final apiClient = context.read<ApiClient>();
      final broadcastsResponse = await apiClient.get('/mobility/broadcasts');
      final visitsResponse = await apiClient.get('/mobility/my-visits');

      setState(() {
        _broadcasts = broadcastsResponse.data;
        _myVisits = visitsResponse.data;
        _isLoading = false;
      });
    } catch (e) {
      print('Failed to fetch mobility data: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 120.0,
            floating: true,
            pinned: true,
            backgroundColor: AppColors.bgPrimary,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              title: Row(
                children: [
                  Icon(LucideIcons.truck, color: AppColors.accentPrimary, size: 20),
                  const SizedBox(width: 8),
                  const Text(
                    'MOBILITY NODE',
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

          // Action Section
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.accentPrimary.withOpacity(0.2), Colors.transparent],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: AppColors.accentPrimary.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'STRATEGIC DISPATCH',
                      style: TextStyle(color: AppColors.accentPrimary, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Request Site Infrastructure Access',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accentPrimary,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      ),
                      child: const Text('INITIATE REQUEST', style: TextStyle(fontWeight: FontWeight.w900)),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Broadcasts Header
          _buildSectionHeader('ACTIVE BROADCASTS', 'Real-time vehicle hire requests'),

          if (_isLoading)
            const SliverToBoxAdapter(child: Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator(color: AppColors.accentPrimary))))
          else if (_broadcasts.isEmpty)
            _buildEmptyState('No active broadcasts', LucideIcons.radio)
          else
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) => _buildBroadcastItem(_broadcasts[index]),
                childCount: _broadcasts.length,
              ),
            ),

          // Visits Header
          _buildSectionHeader('MY SITE VISITS', 'Your upcoming infrastructure tours'),

          if (_isLoading)
            const SliverToBoxAdapter(child: SizedBox())
          else if (_myVisits.isEmpty)
            _buildEmptyState('No scheduled visits', LucideIcons.mapPin)
          else
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) => _buildVisitItem(_myVisits[index]),
                childCount: _myVisits.length,
              ),
            ),

          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, String subtitle) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 32, 20, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(color: AppColors.textTertiary, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.5),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBroadcastItem(dynamic broadcast) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.accentPrimary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(LucideIcons.car, color: AppColors.accentPrimary, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  broadcast['location'] ?? 'Undefined Sector',
                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w900),
                ),
                Text(
                  '${broadcast['duration']} • ${broadcast['engineer']['name']}',
                  style: const TextStyle(color: AppColors.textTertiary, fontSize: 10),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '\$${broadcast['price']}',
                style: const TextStyle(color: AppColors.accentPrimary, fontSize: 14, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 4),
              const Text('BROADCASTING', style: TextStyle(color: Colors.blue, fontSize: 8, fontWeight: FontWeight.w900)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildVisitItem(dynamic visit) {
    final status = visit['status'] ?? 'PENDING';
    final isApproved = status == 'APPROVED';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withOpacity(0.5),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        children: [
          Icon(LucideIcons.calendar, color: isApproved ? AppColors.accentPrimary : AppColors.textTertiary, size: 20),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  visit['project']['title'] ?? 'Strategic Site',
                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800),
                ),
                Text(
                  visit['project']['engineerProfile']['user']['name'] ?? 'Assigned Architect',
                  style: const TextStyle(color: AppColors.textTertiary, fontSize: 10),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: (isApproved ? AppColors.accentPrimary : Colors.orange).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              status,
              style: TextStyle(
                color: isApproved ? AppColors.accentPrimary : Colors.orange,
                fontSize: 9,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(String message, IconData icon) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.all(60),
        child: Column(
          children: [
            Icon(icon, size: 48, color: Colors.white.withOpacity(0.05)),
            const SizedBox(height: 16),
            Text(message, style: const TextStyle(color: AppColors.textTertiary, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}
