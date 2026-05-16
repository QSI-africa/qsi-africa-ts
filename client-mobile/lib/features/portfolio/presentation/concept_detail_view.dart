import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import '../bloc/portfolio_bloc.dart';
import '../bloc/portfolio_event.dart';
import '../bloc/portfolio_state.dart';
import '../data/models/portfolio_item.dart';
import 'widgets/strategic_metrics_grid.dart';
import 'engagement_portal_sheet.dart';

class ConceptDetailView extends StatefulWidget {
  final String id;
  const ConceptDetailView({super.key, required this.id});

  @override
  State<ConceptDetailView> createState() => _ConceptDetailViewState();
}

class _ConceptDetailViewState extends State<ConceptDetailView> {
  @override
  void initState() {
    super.initState();
    context.read<PortfolioBloc>().add(FetchItemDetail(widget.id, PortfolioType.concept));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: BlocBuilder<PortfolioBloc, PortfolioState>(
        builder: (context, state) {
          if (state.status == PortfolioStatus.loading || state.selectedItem == null) {
            return const Center(child: CircularProgressIndicator(color: AppColors.accentPrimary));
          }

          if (state.status == PortfolioStatus.failure) {
            return Center(child: Text(state.errorMessage ?? 'Error', style: const TextStyle(color: Colors.red)));
          }

          final item = state.selectedItem!;

          return CustomScrollView(
            slivers: [
              // Hero Section
              SliverAppBar(
                expandedHeight: 300.0,
                pinned: true,
                backgroundColor: AppColors.bgPrimary,
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      if (item.image != null)
                        CachedNetworkImage(
                          imageUrl: item.image!,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => Container(color: AppColors.bgSecondary),
                          errorWidget: (context, url, error) => Container(color: AppColors.bgSecondary),
                        ),
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withOpacity(0.3),
                              AppColors.bgPrimary,
                            ],
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 40,
                        left: 20,
                        right: 20,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.accentPrimary,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                item.status?.toUpperCase() ?? 'STRATEGIC',
                                style: const TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              item.title.toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 28,
                                fontWeight: FontWeight.w900,
                                letterSpacing: -1,
                                height: 1.1,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                leading: IconButton(
                  icon: Icon(LucideIcons.arrowLeft, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                ),
              ),

              // Content
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    // Metadata Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildMetaItem(LucideIcons.calendar, 'PUBLICATION', 'May 2026'),
                        _buildMetaItem(LucideIcons.globe, 'SCOPE', 'Pan-African'),
                        _buildMetaItem(LucideIcons.layers, 'FRAMEWORK', item.category),
                      ],
                    ),
                    const SizedBox(height: 40),

                    // Metrics Grid
                    StrategicMetricsGrid(metrics: item.metrics),
                    const SizedBox(height: 40),

                    // Technical Content
                    const Text(
                      'TECHNICAL ARCHITECTURE',
                      style: TextStyle(
                        color: AppColors.textTertiary,
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 16),
                    MarkdownBody(
                      data: item.expandedView ?? item.shortDescription,
                      styleSheet: MarkdownStyleSheet(
                        p: const TextStyle(color: AppColors.textSecondary, fontSize: 15, height: 1.6),
                        h3: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, height: 2.0),
                        listBullet: const TextStyle(color: AppColors.accentPrimary),
                      ),
                    ),
                    const SizedBox(height: 40),

                    // Engagement Portal Button
                    Container(
                      padding: const EdgeInsets.all(28),
                      decoration: BoxDecoration(
                        color: AppColors.bgSecondary,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.borderSubtle),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'ENGAGEMENT PORTAL',
                            style: TextStyle(color: AppColors.accentPrimary, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2),
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'MISSION CONTROL',
                            style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Actualize this strategic framework within the QSI Africa ecosystem.',
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 14, height: 1.5),
                          ),
                          const SizedBox(height: 24),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: () => _showEngagementPortal(context, item),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.accentPrimary,
                                foregroundColor: Colors.black,
                                padding: const EdgeInsets.symmetric(vertical: 18),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              ),
                              child: const Text(
                                'INITIATE COLLABORATION',
                                style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 60),
                  ]),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildMetaItem(IconData icon, String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 12, color: AppColors.accentPrimary),
            const SizedBox(width: 4),
            Text(
              label,
              style: const TextStyle(color: AppColors.textTertiary, fontSize: 8, fontWeight: FontWeight.w800, letterSpacing: 0.5),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          value.toUpperCase(),
          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
        ),
      ],
    );
  }

  void _showEngagementPortal(BuildContext context, PortfolioItem item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => EngagementPortalSheet(item: item),
    );
  }
}
