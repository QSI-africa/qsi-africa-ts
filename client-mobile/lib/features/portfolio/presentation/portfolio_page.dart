import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import '../bloc/portfolio_bloc.dart';
import '../bloc/portfolio_event.dart';
import '../bloc/portfolio_state.dart';
import '../data/models/portfolio_item.dart';
import 'concept_detail_view.dart';
import 'demo_detail_view.dart';

class PortfolioPage extends StatefulWidget {
  const PortfolioPage({super.key});

  @override
  State<PortfolioPage> createState() => _PortfolioPageState();
}

class _PortfolioPageState extends State<PortfolioPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    context.read<PortfolioBloc>().add(const FetchPortfolio());
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: CustomScrollView(
        slivers: [
          // Header
          SliverAppBar(
            expandedHeight: 140.0,
            floating: false,
            pinned: true,
            backgroundColor: AppColors.bgPrimary,
            flexibleSpace: FlexibleSpaceBar(
              centerTitle: false,
              titlePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              title: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: AppColors.accentPrimary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Icon(LucideIcons.layers, color: AppColors.accentPrimary, size: 14),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'PORTFOLIO',
                        style: const TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 2,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Strategic Assets & Demonstrators',
                    style: TextStyle(
                      color: AppColors.textTertiary,
                      fontSize: 8,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topRight,
                    end: Alignment.bottomLeft,
                    colors: [
                      AppColors.accentPrimary.withOpacity(0.05),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Category Chips
          SliverToBoxAdapter(
            child: Container(
              height: 60,
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: BlocBuilder<PortfolioBloc, PortfolioState>(
                builder: (context, state) {
                  return ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: ['all', 'infrastructure', 'governance', 'renaissance', 'energy', 'mobility']
                        .map((cat) => _buildCategoryChip(cat, state.category))
                        .toList(),
                  );
                },
              ),
            ),
          ),

          // Tab Bar
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.bgSecondary,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  color: AppColors.accentPrimary,
                  borderRadius: BorderRadius.circular(10),
                ),
                indicatorSize: TabBarIndicatorSize.tab,
                labelColor: Colors.black,
                unselectedLabelColor: AppColors.textTertiary,
                labelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1),
                padding: const EdgeInsets.all(4),
                tabs: const [
                  Tab(text: 'CONCEPTS'),
                  Tab(text: 'DEMOS'),
                ],
              ),
            ),
          ),

          // Content
          BlocBuilder<PortfolioBloc, PortfolioState>(
            builder: (context, state) {
              if (state.status == PortfolioStatus.loading) {
                return const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator(color: AppColors.accentPrimary)),
                );
              }

              if (state.status == PortfolioStatus.failure) {
                return SliverFillRemaining(
                  child: Center(
                    child: Text(
                      state.errorMessage ?? 'Failed to load portfolio',
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
                );
              }

              return SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
                sliver: _tabController.index == 0
                    ? _buildList(state.concepts)
                    : _buildList(state.demos),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String cat, String selected) {
    final isSelected = cat == selected;
    return GestureDetector(
      onTap: () => context.read<PortfolioBloc>().add(ChangePortfolioCategory(cat)),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accentPrimary.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.accentPrimary : AppColors.borderSubtle,
          ),
        ),
        child: Text(
          cat.toUpperCase(),
          style: TextStyle(
            color: isSelected ? AppColors.accentPrimary : AppColors.textSecondary,
            fontSize: 10,
            fontWeight: FontWeight.w900,
            letterSpacing: 1,
          ),
        ),
      ),
    );
  }

  Widget _buildList(List<PortfolioItem> items) {
    if (items.isEmpty) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.only(top: 100),
          child: Column(
            children: [
              Icon(LucideIcons.activity, size: 48, color: AppColors.borderSubtle),
              const SizedBox(height: 16),
              const Text(
                'NO ASSETS FOUND',
                style: TextStyle(color: AppColors.textTertiary, fontWeight: FontWeight.w800, letterSpacing: 2),
              ),
            ],
          ),
        ),
      );
    }

    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) {
          final item = items[index];
          return TweenAnimationBuilder(
            duration: Duration(milliseconds: 400 + (index * 100)),
            tween: Tween<double>(begin: 0, end: 1),
            builder: (context, double value, child) {
              return Opacity(
                opacity: value,
                child: Transform.translate(
                  offset: Offset(0, 20 * (1 - value)),
                  child: child,
                ),
              );
            },
            child: _PortfolioCard(item: item),
          );
        },
        childCount: items.length,
      ),
    );

  }
}

class _PortfolioCard extends StatelessWidget {
  final PortfolioItem item;

  const _PortfolioCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        if (item.type == PortfolioType.concept) {
          Navigator.push(context, MaterialPageRoute(builder: (_) => ConceptDetailView(id: item.id)));
        } else {
          Navigator.push(context, MaterialPageRoute(builder: (_) => DemoDetailView(id: item.id)));
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
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
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.accentPrimary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    item.type == PortfolioType.concept ? LucideIcons.lightbulb : LucideIcons.building2,
                    color: AppColors.accentPrimary,
                    size: 20,
                  ),
                ),
                const Spacer(),
                if (item.status != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.accentPrimary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      item.status!.toUpperCase(),
                      style: const TextStyle(color: AppColors.accentPrimary, fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 1),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 20),
            Text(
              item.title.toUpperCase(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w900,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              item.shortDescription,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 13,
                height: 1.5,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                const Text(
                  'VIEW ANALYSIS',
                  style: TextStyle(color: AppColors.accentPrimary, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.5),
                ),
                const SizedBox(width: 4),
                Icon(LucideIcons.arrowRight, size: 14, color: AppColors.accentPrimary),
                const Spacer(),
                Opacity(
                  opacity: 0.1,
                  child: Icon(
                    item.type == PortfolioType.concept ? LucideIcons.zap : LucideIcons.mapPin,
                    size: 32,
                    color: AppColors.accentPrimary,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
