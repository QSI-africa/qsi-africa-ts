import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import '../bloc/portfolio_bloc.dart';
import '../bloc/portfolio_event.dart';
import '../bloc/portfolio_state.dart';
import '../data/models/portfolio_item.dart';

class EngagementPortalSheet extends StatefulWidget {
  final PortfolioItem item;
  const EngagementPortalSheet({super.key, required this.item});

  @override
  State<EngagementPortalSheet> createState() => _EngagementPortalSheetState();
}

class _EngagementPortalSheetState extends State<EngagementPortalSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _messageController = TextEditingController();
  String _selectedType = 'partner';

  final List<Map<String, dynamic>> _options = [
    {'value': 'partner', 'label': 'Partner', 'icon': LucideIcons.handshake},
    {'value': 'invest', 'label': 'Invest', 'icon': LucideIcons.trendingUp},
    {'value': 'meeting', 'label': 'Sync', 'icon': LucideIcons.users},
    {'value': 'custom', 'label': 'Other', 'icon': LucideIcons.lightbulb},
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      final data = {
        'pilotKey': widget.item.id,
        'pilotTitle': widget.item.title,
        'engagementType': _selectedType,
        'contactName': _nameController.text,
        'contactEmail': _emailController.text,
        'message': _messageController.text,
        'timestamp': DateTime.now().toIso8601String(),
      };
      context.read<PortfolioBloc>().add(SubmitEngagement(data));
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<PortfolioBloc, PortfolioState>(
      listener: (context, state) {
        if (state.status == PortfolioStatus.success && state.selectedItem == widget.item) {
           // We might need a more specific state for submission success
           // For now, let's just close if success and selectedItem matches
           // Actually, let's just check if the last action was a submission
        }
        // Simplified feedback
        if (state.status == PortfolioStatus.success && _nameController.text.isNotEmpty) {
           ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Engagement synchronized successfully!'), backgroundColor: AppColors.successGreen),
          );
          Navigator.pop(context);
        }
      },
      child: Container(
        padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
        decoration: const BoxDecoration(
          color: AppColors.bgSecondary,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          border: Border(top: BorderSide(color: AppColors.borderSubtle)),
        ),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.borderSubtle,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                const Text(
                  'STRATEGIC ALIGNMENT',
                  style: TextStyle(color: AppColors.accentPrimary, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2),
                ),
                const SizedBox(height: 8),
                const Text(
                  'INITIATE SYNC',
                  style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                ),
                const SizedBox(height: 32),

                // Choice Grid
                const Text(
                  'CHOOSE YOUR STRATEGIC PATHWAY',
                  style: TextStyle(color: AppColors.textTertiary, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 1),
                ),
                const SizedBox(height: 16),
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 4,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.9,
                  ),
                  itemCount: _options.length,
                  itemBuilder: (context, index) {
                    final opt = _options[index];
                    final isSelected = _selectedType == opt['value'];
                    return GestureDetector(
                      onTap: () => setState(() => _selectedType = opt['value']),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.accentPrimary : AppColors.bgTertiary,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected ? AppColors.accentPrimary : AppColors.borderSubtle,
                          ),
                          boxShadow: isSelected ? [
                            BoxShadow(color: AppColors.accentPrimary.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))
                          ] : null,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(opt['icon'], color: isSelected ? Colors.black : AppColors.textTertiary, size: 20),
                            const SizedBox(height: 8),
                            Text(
                              opt['label'].toUpperCase(),
                              style: TextStyle(
                                color: isSelected ? Colors.black : AppColors.textTertiary,
                                fontSize: 8,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 32),

                // Fields
                _buildField('FULL IDENTITY', _nameController, 'ENTER NAME'),
                const SizedBox(height: 20),
                _buildField('NETWORK EMAIL', _emailController, 'NAME@DOMAIN.COM', isEmail: true),
                const SizedBox(height: 20),
                _buildField('STRATEGIC CONTEXT', _messageController, 'Describe your vision...', maxLines: 3),
                const SizedBox(height: 32),

                // Submit Button
                BlocBuilder<PortfolioBloc, PortfolioState>(
                  builder: (context, state) {
                    final isLoading = state.status == PortfolioStatus.loading;
                    return SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: isLoading ? null : _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.accentPrimary,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 18),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          disabledBackgroundColor: AppColors.accentPrimary.withOpacity(0.5),
                        ),
                        child: Text(
                          isLoading ? 'SYNCHRONIZING...' : 'ESTABLISH SYNC',
                          style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1),
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text(
                      'ABORT',
                      style: TextStyle(color: AppColors.textTertiary, fontWeight: FontWeight.w800, letterSpacing: 1),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildField(String label, TextEditingController controller, String hint, {bool isEmail = false, int maxLines = 1}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: AppColors.textTertiary, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 1),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          maxLines: maxLines,
          style: const TextStyle(color: Colors.white, fontSize: 14),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: AppColors.textTertiary.withOpacity(0.5), fontSize: 14),
            filled: true,
            fillColor: AppColors.bgTertiary,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            contentPadding: const EdgeInsets.all(16),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) return 'Required';
            if (isEmail && !value.contains('@')) return 'Invalid email';
            return null;
          },
        ),
      ],
    );
  }
}
