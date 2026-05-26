import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../bloc/finance_bloc.dart';
import '../data/models/finance_models.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import 'widgets/strategic_wallet_card.dart';

class FinanceView extends StatelessWidget {
  const FinanceView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: BlocBuilder<FinanceBloc, FinanceState>(
        builder: (context, state) {
          if (state.status == FinanceStatus.loading) {
            return const Center(child: CircularProgressIndicator(color: AppColors.accentPrimary));
          }

          if (state.status == FinanceStatus.failure) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(LucideIcons.triangleAlert, color: Colors.orange, size: 48),
                  const SizedBox(height: 16),
                  Text(state.errorMessage ?? 'Financial sync failed', style: const TextStyle(color: Colors.white)),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => context.read<FinanceBloc>().add(FetchFinanceData()),
                    child: const Text('RETRY SYNC'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              context.read<FinanceBloc>().add(FetchFinanceData());
            },
            child: CustomScrollView(
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
                        const SizedBox(width: 32),
                        Icon(LucideIcons.receipt, color: AppColors.accentPrimary, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          'FINANCE',
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

              // Wallet Section
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: state.wallet != null 
                    ? StrategicWalletCard(wallet: state.wallet!)
                    : const SizedBox(),
                ),
              ),

              // Quick Actions
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildQuickAction(LucideIcons.plus, 'DEPOSIT'),
                      _buildQuickAction(LucideIcons.arrowUpRight, 'TRANSFER'),
                      _buildQuickAction(LucideIcons.fileDown, 'REPORT'),
                      _buildQuickAction(LucideIcons.settings, 'LIMITS'),
                    ],
                  ),
                ),
              ),

              // Transaction History
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 32, 20, 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'RECENT TRANSACTIONS',
                        style: TextStyle(
                          color: AppColors.textTertiary,
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.5,
                        ),
                      ),
                      Text(
                        'VIEW ALL',
                        style: TextStyle(
                          color: AppColors.accentPrimary,
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              if (state.transactions.isEmpty)
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(40),
                    child: Center(child: Text('No recent transactions', style: TextStyle(color: AppColors.textTertiary))),
                  ),
                )
              else
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final tx = state.transactions[index];
                      return _buildTransactionItem(tx);
                    },
                    childCount: state.transactions.length,
                  ),
                ),

              // Invoices Section
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 32, 20, 16),
                  child: const Text(
                    'BILLING OVERSIGHT',
                    style: TextStyle(
                      color: AppColors.textTertiary,
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
              ),

              if (state.invoices.isEmpty)
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(40),
                    child: Center(child: Text('No pending invoices', style: TextStyle(color: AppColors.textTertiary))),
                  ),
                )
              else
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final invoice = state.invoices[index];
                      return _buildInvoiceItem(invoice);
                    },
                    childCount: state.invoices.length,
                  ),
                ),

              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          ),
        );
      },
    );
  }

  Widget _buildQuickAction(IconData icon, String label) {
    return Column(
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: AppColors.bgSecondary,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: Icon(icon, color: Colors.white, size: 20),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(
            color: AppColors.textTertiary,
            fontSize: 9,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
        ),
      ],
    );
  }

  Widget _buildTransactionItem(Transaction tx) {
    final isCredit = tx.type == 'credit';
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
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: (isCredit ? AppColors.successGreen : Colors.orange).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isCredit ? LucideIcons.arrowDownLeft : LucideIcons.arrowUpRight,
              color: isCredit ? AppColors.successGreen : Colors.orange,
              size: 16,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tx.title,
                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800),
                ),
                Text(
                  DateFormat('MMM dd, hh:mm a').format(tx.date),
                  style: const TextStyle(color: AppColors.textTertiary, fontSize: 10),
                ),
              ],
            ),
          ),
          Text(
            '${isCredit ? '+' : '-'}\$${tx.amount.toStringAsFixed(2)}',
            style: TextStyle(
              color: isCredit ? AppColors.successGreen : Colors.white,
              fontSize: 15,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInvoiceItem(Invoice invoice) {
    final isPaid = invoice.status == 'PAID';
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
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                invoice.invoiceNumber,
                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w900),
              ),
              Text(
                DateFormat('MMM dd, yyyy').format(invoice.issueDate),
                style: const TextStyle(color: AppColors.textTertiary, fontSize: 10),
              ),
            ],
          ),
          const Spacer(),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '\$${invoice.totalAmount.toStringAsFixed(2)}',
                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: (isPaid ? AppColors.accentPrimary : Colors.orange).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  invoice.status,
                  style: TextStyle(
                    color: isPaid ? AppColors.accentPrimary : Colors.orange,
                    fontSize: 8,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 16),
          Icon(LucideIcons.fileDown, color: AppColors.textTertiary, size: 20),
        ],
      ),
    );
  }
}
