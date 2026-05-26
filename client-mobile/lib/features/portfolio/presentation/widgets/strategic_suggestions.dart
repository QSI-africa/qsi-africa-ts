import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:qsi_client_mobile/core/api/api_client.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';

class StrategicSuggestions extends StatefulWidget {
  final String module;
  const StrategicSuggestions({super.key, required this.module});

  @override
  State<StrategicSuggestions> createState() => _StrategicSuggestionsState();
}

class _StrategicSuggestionsState extends State<StrategicSuggestions> {
  List<dynamic> _suggestions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchSuggestions();
  }

  Future<void> _fetchSuggestions() async {
    try {
      final response = await context.read<ApiClient>().get('/submit/${widget.module}-suggestions');
      setState(() {
        _suggestions = response.data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const SizedBox(height: 100, child: Center(child: CircularProgressIndicator()));
    if (_suggestions.isEmpty) return const SizedBox();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'AI-DRIVEN SUGGESTIONS',
          style: TextStyle(
            color: AppColors.textTertiary,
            fontSize: 10,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 16),
        ..._suggestions.take(3).map((s) => _buildSuggestionCard(s)).toList(),
      ],
    );
  }

  Widget _buildSuggestionCard(dynamic suggestion) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withOpacity(0.3),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.accentPrimary.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Icon(LucideIcons.sparkles, color: AppColors.accentPrimary, size: 16),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              suggestion['suggestion'] ?? suggestion['title'] ?? 'Strategic optimization available',
              style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }
}
