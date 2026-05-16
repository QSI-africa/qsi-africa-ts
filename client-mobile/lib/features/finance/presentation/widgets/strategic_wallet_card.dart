import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:qsi_client_mobile/features/finance/data/models/finance_models.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';

class StrategicWalletCard extends StatelessWidget {
  final Wallet wallet;
  const StrategicWalletCard({super.key, required this.wallet});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withOpacity(0.8),
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 40,
            offset: const Offset(0, 20),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'STRATEGIC LIQUIDITY',
                style: TextStyle(
                  color: AppColors.accentPrimary,
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2,
                ),
              ),
              Icon(LucideIcons.shieldCheck, color: AppColors.accentPrimary.withOpacity(0.5), size: 16),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            '${wallet.currency} ${wallet.balance.toStringAsFixed(2)}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 36,
              fontWeight: FontWeight.w900,
              letterSpacing: -1,
            ),
          ),
          const SizedBox(height: 32),
          Row(
            children: [
              _buildMiniStat('TOTAL INVESTED', '\$${wallet.totalInvested.toStringAsFixed(0)}'),
              const SizedBox(width: 32),
              _buildMiniStat('ACTIVE ASSETS', '${wallet.activeAssets}'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMiniStat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.textTertiary,
            fontSize: 8,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}
