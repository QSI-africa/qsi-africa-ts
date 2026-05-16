import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import '../../logic/presentation/chat_page.dart';
import '../../portfolio/data/models/portfolio_item.dart';
import 'search_page.dart';
import 'widgets/intelligence_feed.dart';

class HomeView extends StatelessWidget {
  const HomeView({super.key});

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
            centerTitle: false,
            titlePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: AppColors.accentPrimary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Icon(LucideIcons.activity, color: AppColors.accentPrimary, size: 20),
                ),
                const SizedBox(width: 12),
                const Text(
                  'MISSION CONTROL',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 2,
                  ),
                ),
              ],
            ),
          ),
          actions: [
            IconButton(
              icon: Icon(LucideIcons.search, color: AppColors.textSecondary),
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchPage())),
            ),
            IconButton(
              icon: Icon(LucideIcons.bell, color: AppColors.textSecondary),
              onPressed: () {},
            ),
            const SizedBox(width: 8),
          ],
        ),

        // Summary Stats
        SliverToBoxAdapter(
          child: Container(
            height: 110,
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _buildSummaryTile('ACTIVE PROJECTS', '12', LucideIcons.layers, AppColors.accentPrimary),
                _buildSummaryTile('SYSTEM HEALTH', '98%', LucideIcons.activity, Colors.blue),
                _buildSummaryTile('ACTIVE ALERTS', '03', LucideIcons.triangleAlert, Colors.orange),
                _buildSummaryTile('NETWORK', '4.2k', LucideIcons.users, Colors.purple),
              ],
            ),
          ),
        ),

        // Module Navigation
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'OPERATIONAL MODULES',
                  style: TextStyle(
                    color: AppColors.textTertiary,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 16),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.1,
                  children: [
                    _buildModuleCard(context, LucideIcons.wrench, 'TOOLS', 'System Management', AppColors.accentPrimary, 'infrastructure'),
                    _buildModuleCard(context, LucideIcons.tv, 'TV', 'Broadcasting Node', Colors.blue, 'vision'),
                    _buildModuleCard(context, LucideIcons.music, 'MUSIC', 'Sonic Atmosphere', Colors.purple, 'healing'),
                    _buildModuleCard(context, LucideIcons.layers, 'VISION', 'Hyper Infrastructure', Colors.orange, 'vision'),
                  ],
                ),
              ],
            ),
          ),
        ),

        // Intelligence Feed Header
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
            child: Row(
              children: [
                const Text(
                  'INTELLIGENCE FEED',
                  style: TextStyle(
                    color: AppColors.textTertiary,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.5,
                  ),
                ),
                const Spacer(),
                TextButton(
                  onPressed: () {},
                  child: Row(
                    children: [
                      const Text('FILTER', style: TextStyle(color: AppColors.textTertiary, fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(width: 4),
                      Icon(LucideIcons.filter, size: 16, color: AppColors.textTertiary),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        // Feed List
        const SliverPadding(
          padding: EdgeInsets.fromLTRB(20, 0, 20, 100),
          sliver: IntelligenceFeed(),
        ),
      ],
    );
  }

  Widget _buildSummaryTile(String label, String value, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 12),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  color: AppColors.textTertiary,
                  fontSize: 8,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModuleCard(BuildContext context, IconData icon, String title, String subtitle, Color accent, String tag) {
    return GestureDetector(
      onTap: () {
        if (title == 'TOOLS') {
          Navigator.push(context, MaterialPageRoute(builder: (_) => ChatPage(moduleName: title)));
        }
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.bgSecondary,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: AppColors.borderSubtle),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: accent.withOpacity(0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: accent, size: 24),
            ),
            const Spacer(),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w900,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(
                color: AppColors.textTertiary,
                fontSize: 10,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
