import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:qsi_client_mobile/core/api/api_client.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import 'widgets/profile_card.dart';

class NetworkView extends StatefulWidget {
  const NetworkView({super.key});

  @override
  State<NetworkView> createState() => _NetworkViewState();
}

class _NetworkViewState extends State<NetworkView> {
  List<dynamic> _engineers = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String _activeTab = 'ALL';

  @override
  void initState() {
    super.initState();
    _fetchNetworkData();
  }

  Future<void> _fetchNetworkData() async {
    try {
      final response = await context.read<ApiClient>().get('/network/engineers');
      setState(() {
        _engineers = response.data;
        _isLoading = false;
      });
    } catch (e) {
      print('Failed to fetch network data: $e');
      setState(() => _isLoading = false);
    }
  }

  List<dynamic> get _filteredEngineers {
    var result = _engineers.where((eng) {
      final name = eng['user']['name'].toString().toLowerCase();
      final spec = (eng['specialization'] ?? '').toString().toLowerCase();
      return name.contains(_searchQuery.toLowerCase()) || spec.contains(_searchQuery.toLowerCase());
    }).toList();

    if (_activeTab == 'SOVEREIGN') {
      result = result.where((eng) => eng['isVerified'] == true).toList();
    } else if (_activeTab == 'PROFESSIONALS') {
      result = result.where((eng) => eng['isVerified'] != true).toList();
    }

    return result;
  }

  String _getServerUrl(String? path) {
    if (path == null || path.isEmpty) return 'https://ui-avatars.com/api/?name=User&background=111A16&color=10B981';
    return path.startsWith('http') ? path : 'https://api.qsi.africa$path';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: CustomScrollView(
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
                  const SizedBox(width: 32), // Space for back button
                  Icon(LucideIcons.users, color: AppColors.accentPrimary, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'SOVEREIGN MINDS',
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

        // Tabs Section
        SliverToBoxAdapter(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              children: [
                _buildTab('ALL', 'All Members'),
                _buildTab('SOVEREIGN', 'Verified Minds'),
                _buildTab('PROFESSIONALS', 'Professionals'),
              ],
            ),
          ),
        ),

        // Search Bar
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.bgSecondary,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: TextField(
                onChanged: (v) => setState(() => _searchQuery = v),
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Search sovereign minds...',
                  hintStyle: const TextStyle(color: AppColors.textTertiary, fontSize: 14),
                  prefixIcon: Icon(LucideIcons.search, size: 18, color: AppColors.textTertiary),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
              ),
            ),
          ),
        ),

        if (_isLoading)
          const SliverFillRemaining(
            child: Center(child: CircularProgressIndicator(color: AppColors.accentPrimary)),
          )
        else if (_filteredEngineers.isEmpty)
          SliverFillRemaining(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(LucideIcons.searchCode, size: 48, color: Colors.white.withOpacity(0.05)),
                  const SizedBox(height: 16),
                  const Text('No minds found in this sector', style: TextStyle(color: AppColors.textTertiary)),
                ],
              ),
            ),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final engineer = _filteredEngineers[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: NetworkProfileCard(
                      name: engineer['user']['name'],
                      role: engineer['specialization'] ?? 'Strategy Architect',
                      sector: engineer['sector'] ?? 'Pan-African',
                      imageUrl: _getServerUrl(engineer['user']['avatar']),
                    ),
                  );
                },
                childCount: _filteredEngineers.length,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTab(String label, String subtitle) {
    final isActive = _activeTab == label;
    return GestureDetector(
      onTap: () => setState(() => _activeTab = label),
      child: Container(
        margin: const EdgeInsets.only(right: 12),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: isActive ? AppColors.accentPrimary.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isActive ? AppColors.accentPrimary : AppColors.borderSubtle,
          ),
        ),
        child: Text(
          label.toUpperCase(),
          style: TextStyle(
            color: isActive ? Colors.white : AppColors.textTertiary,
            fontSize: 10,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
        ),
      ),
    );
  }
}
