import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  final _searchController = TextEditingController();
  bool _isSearching = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: SafeArea(
        child: Column(
          children: [
            // Search Header
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 56,
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      decoration: BoxDecoration(
                        color: AppColors.bgSecondary,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.borderSubtle),
                      ),
                      child: Row(
                        children: [
                          Icon(LucideIcons.search, color: AppColors.textTertiary, size: 20),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextField(
                              controller: _searchController,
                              onChanged: (value) {
                                setState(() {
                                  _isSearching = value.isNotEmpty;
                                });
                              },
                              style: const TextStyle(color: Colors.white, fontSize: 16),
                              decoration: const InputDecoration(
                                hintText: 'Search QSI ecosystem...',
                                hintStyle: TextStyle(color: AppColors.textTertiary),
                                border: InputBorder.none,
                              ),
                            ),
                          ),
                          if (_isSearching)
                            GestureDetector(
                              onTap: () {
                                _searchController.clear();
                                setState(() {
                                  _isSearching = false;
                                });
                              },
                              child: Icon(LucideIcons.x, color: AppColors.textTertiary, size: 20),
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Text(
                      'Cancel',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Content
            Expanded(
              child: _isSearching ? _buildSearchResults() : _buildSearchSuggestions(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchSuggestions() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      children: [
        const Text(
          'SUGGESTED CATEGORIES',
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w800,
            color: AppColors.textTertiary,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            _buildCategoryChip('Strategic Concepts', LucideIcons.lightbulb),
            _buildCategoryChip('City Demos', LucideIcons.building2),
            _buildCategoryChip('Technical Labs', LucideIcons.beaker),
            _buildCategoryChip('Regional Network', LucideIcons.users),
          ],
        ),
        const SizedBox(height: 40),
        const Text(
          'RECENT SEARCHES',
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w800,
            color: AppColors.textTertiary,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 16),
        _buildRecentSearchItem('Hyper-mobility infrastructure'),
        _buildRecentSearchItem('Sovereign Cloud architecture'),
        _buildRecentSearchItem('Dakar Smart Port'),
      ],
    );
  }

  Widget _buildCategoryChip(String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.accentPrimary),
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentSearchItem(String label) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Icon(LucideIcons.clock, size: 16, color: AppColors.textTertiary),
          const SizedBox(width: 16),
          Text(
            label,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          const Spacer(),
          Icon(LucideIcons.arrowUpLeft, size: 16, color: AppColors.textTertiary),
        ],
      ),
    );
  }

  Widget _buildSearchResults() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      children: [
        _buildSearchResultItem('QSI Core Infrastructure', 'STRATEGIC CONCEPT', LucideIcons.layers),
        _buildSearchResultItem('Abidjan Mobility Node', 'SMART CITY DEMO', LucideIcons.building2),
        _buildSearchResultItem('Strategic Assets Audit 2026', 'DOCUMENT', LucideIcons.fileText),
      ],
    );
  }

  Widget _buildSearchResultItem(String title, String subtitle, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withOpacity(0.5),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.accentPrimary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppColors.accentPrimary, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 8,
                    fontWeight: FontWeight.w800,
                    color: AppColors.accentPrimary,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          Icon(LucideIcons.chevronRight, color: AppColors.textTertiary, size: 20),
        ],
      ),
    );
  }
}
