import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:qsi_client_mobile/core/api/api_client.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import '../../logic/presentation/chat_page.dart';

class HealingView extends StatefulWidget {
  const HealingView({super.key});

  @override
  State<HealingView> createState() => _HealingViewState();
}

class _HealingViewState extends State<HealingView> {
  bool _isLoading = true;
  List<dynamic> _packages = [];

  @override
  void initState() {
    super.initState();
    _fetchPackages();
  }

  Future<void> _fetchPackages() async {
    try {
      final response = await context.read<ApiClient>().get('/submit/healing-packages');
      setState(() {
        _packages = response.data;
        _isLoading = false;
      });
    } catch (e) {
      print('Failed to fetch healing packages: $e');
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
            expandedHeight: 160.0,
            floating: true,
            pinned: true,
            backgroundColor: AppColors.bgPrimary,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              title: Row(
                children: [
                  Icon(LucideIcons.sparkles, color: AppColors.accentPrimary, size: 20),
                  const SizedBox(width: 8),
                  const Text(
                    'HEALING SPACE',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2,
                    ),
                  ),
                ],
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.accentPrimary.withOpacity(0.05), Colors.transparent],
                    begin: Alignment.topRight,
                    end: Alignment.bottomLeft,
                  ),
                ),
              ),
            ),
          ),

          // Intro
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'RENAISSANCE THERAPY',
                    style: TextStyle(color: AppColors.accentPrimary, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Restore Cognitive and Spiritual Coherence',
                    style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900, height: 1.2),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Our healing modules use advanced technical methodologies to address modern systemic struggles and restore internal alignment.',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 14, height: 1.6),
                  ),
                ],
              ),
            ),
          ),

          if (_isLoading)
            const SliverToBoxAdapter(child: Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator(color: AppColors.accentPrimary))))
          else if (_packages.isEmpty)
            _buildEmptyState()
          else
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) => _buildPackageCard(_packages[index]),
                childCount: _packages.length,
              ),
            ),

          // Chat Action
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.bgSecondary,
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: AppColors.accentPrimary.withOpacity(0.2)),
                ),
                child: Column(
                  children: [
                    Icon(LucideIcons.messageSquare, color: AppColors.accentPrimary, size: 32),
                    const SizedBox(height: 16),
                    const Text(
                      'NOT SURE WHERE TO START?',
                      style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 1),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Consult with our Healing AI to find the right module for your journey.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: AppColors.textTertiary, fontSize: 12),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ChatPage(moduleName: 'healing'))),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.accentPrimary,
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        child: const Text('ENTER HEALING CHAT', style: TextStyle(fontWeight: FontWeight.w900)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }

  Widget _buildPackageCard(dynamic package) {
    return GestureDetector(
      onTap: () => _navigateToConsultation(package),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
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
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.accentPrimary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    package['type']?.toString().toUpperCase() ?? 'THERAPY',
                    style: const TextStyle(color: AppColors.accentPrimary, fontSize: 9, fontWeight: FontWeight.w900),
                  ),
                ),
                const Spacer(),
                Text(
                  package['fee'] ?? package['price'] ?? '0',
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              package['title'] ?? package['name'] ?? 'Healing Module',
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            Text(
              package['shortPreview'] ?? package['description'] ?? 'No description provided.',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.5),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => _navigateToConsultation(package),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: AppColors.accentPrimary.withOpacity(0.3)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('VIEW DETAILS', style: TextStyle(color: AppColors.accentPrimary, fontSize: 11, fontWeight: FontWeight.w900)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _navigateToConsultation(dynamic package) {
    Navigator.push(
      context, 
      MaterialPageRoute(
        builder: (_) => ChatPage(
          moduleName: 'healing',
          initialMessage: 'I am interested in the ${package['title'] ?? package['name']} module. How can we begin?',
        )
      )
    );
  }

  Widget _buildEmptyState() {
    return const SliverToBoxAdapter(
      child: Padding(
        padding: EdgeInsets.all(60),
        child: Column(
          children: [
            Icon(LucideIcons.sparkles, size: 48, color: AppColors.borderSubtle),
            const SizedBox(height: 16),
            Text('No healing packages available.', style: TextStyle(color: AppColors.textTertiary)),
          ],
        ),
      ),
    );
  }
}
