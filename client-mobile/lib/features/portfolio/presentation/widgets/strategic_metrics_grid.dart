import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import '../../data/models/portfolio_item.dart';

class StrategicMetricsGrid extends StatelessWidget {
  final List<StrategicMetric> metrics;

  const StrategicMetricsGrid({super.key, required this.metrics});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'STRATEGIC ARCHITECTURE PARAMETERS',
          style: TextStyle(
            color: AppColors.textTertiary,
            fontSize: 10,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 20),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 2.2,
          ),
          itemCount: metrics.length,
          itemBuilder: (context, index) {
            final metric = metrics[index];
            return TweenAnimationBuilder(
              duration: Duration(milliseconds: 500 + (index * 150)),
              tween: Tween<double>(begin: 0, end: 1),
              builder: (context, double value, child) {
                return Opacity(
                  opacity: value,
                  child: Transform.scale(
                    scale: 0.9 + (0.1 * value),
                    child: child,
                  ),
                );
              },
              child: _buildMetricTile(metric),
            );
          },

        ),
      ],
    );
  }

  Widget _buildMetricTile(StrategicMetric metric) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.accentPrimary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              _getIconForName(metric.icon),
              color: AppColors.accentPrimary,
              size: 16,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  metric.label.toUpperCase(),
                  style: const TextStyle(
                    color: AppColors.textTertiary,
                    fontSize: 8,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  metric.value,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getIconForName(String name) {
    switch (name.toLowerCase()) {
      case 'layers':
        return LucideIcons.layers;
      case 'activity':
        return LucideIcons.activity;
      case 'shield-check':
        return LucideIcons.shieldCheck;
      case 'zap':
        return LucideIcons.zap;
      case 'globe':
        return LucideIcons.globe;
      case 'bar-chart-3':
        return LucideIcons.chartBar;
      default:
        return LucideIcons.box;
    }
  }
}
