import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import 'package:qsi_client_mobile/core/api/api_client.dart';
import '../../logic/presentation/chat_page.dart';
import '../../portfolio/presentation/portfolio_page.dart';
import 'search_page.dart';
import '../../network/presentation/network_view.dart';
import '../../finance/presentation/finance_view.dart';
import '../../lab/presentation/lab_view.dart';
import '../../tv/presentation/tv_view.dart';
import '../../mobility/presentation/mobility_view.dart';
import '../../healing/presentation/healing_view.dart';
import '../../vision/presentation/vision_view.dart';

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  List<dynamic> _services = [];
  Map<String, dynamic>? _stats;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
  }

  Future<void> _fetchDashboardData() async {
    try {
      final apiClient = context.read<ApiClient>();
      final servicesResponse = await apiClient.get('/config/services');
      final statsResponse = await apiClient.get('/config/stats');

      if (mounted) {
        setState(() {
          _services = servicesResponse.data;
          _stats = statsResponse.data;
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Failed to fetch dashboard data: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.accentPrimary));
    }

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

        // Summary Stats (Dynamic)
        if (_stats != null)
          SliverToBoxAdapter(
            child: Container(
              height: 110,
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: [
                  _buildSummaryTile('ACTIVE NODES', _stats!['activeNodes'].toString(), LucideIcons.users, AppColors.accentPrimary),
                  _buildSummaryTile('LIVE PILOTS', _stats!['livePilots'].toString(), LucideIcons.layers, Colors.blue),
                  _buildSummaryTile('DIGITAL CONCEPTS', _stats!['digitalConcepts'].toString(), LucideIcons.lightbulb, Colors.purple),
                  _buildSummaryTile('UPTIME', _stats!['uptime'] ?? '99.9%', LucideIcons.activity, Colors.green),
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
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1.1,
                  ),
                  itemCount: _services.length,
                  itemBuilder: (context, index) {
                    final service = _services[index];
                    return _buildModuleCard(context, service);
                  },
                ),
              ],
            ),
          ),
        ),

        const SliverToBoxAdapter(child: SizedBox(height: 100)),
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
                style: const TextStyle(
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

  Widget _buildModuleCard(BuildContext context, dynamic service) {
    final title = service['title'] ?? 'MODULE';
    final category = service['category'] ?? 'generic';
    
    final Map<String, IconData> iconMap = {
      'infrastructure': LucideIcons.layoutGrid,
      'vision': LucideIcons.brain,
      'healing': LucideIcons.sparkles,
      'network': LucideIcons.users,
      'finance': LucideIcons.receipt,
      'mobility': LucideIcons.truck,
      'lab': LucideIcons.beaker,
      'tv': LucideIcons.tv,
      'portfolio': LucideIcons.layers,
    };

    final Map<String, Color> colorMap = {
      'infrastructure': AppColors.accentPrimary,
      'vision': Colors.cyan,
      'healing': Colors.purple,
      'network': Colors.blue,
      'finance': Colors.green,
      'mobility': Colors.orange,
      'lab': Colors.red,
      'tv': Colors.pink,
      'portfolio': Colors.teal,
    };

    final icon = iconMap[category] ?? LucideIcons.activity;
    final accent = colorMap[category] ?? AppColors.accentPrimary;

    return GestureDetector(
      onTap: () {
        if (category == 'infrastructure') {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const ChatPage(moduleName: 'infrastructure')));
        } else if (category == 'vision') {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const VisionView()));
        } else if (category == 'healing') {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const HealingView()));
        } else if (category == 'network') {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const NetworkView()));
        } else if (category == 'finance') {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const FinanceView()));
        } else if (category == 'mobility') {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const MobilityView()));
        } else if (category == 'lab') {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const LabView()));
        } else if (category == 'tv') {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const TvView()));
        } else if (category == 'portfolio') {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const PortfolioPage()));
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
                fontSize: 14,
                fontWeight: FontWeight.w900,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              category.toString().toUpperCase(),
              style: const TextStyle(
                color: AppColors.textTertiary,
                fontSize: 9,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
