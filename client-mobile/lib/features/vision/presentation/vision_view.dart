import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import '../../logic/bloc/logic_bloc.dart';
import '../../logic/bloc/logic_event.dart';
import '../../logic/bloc/logic_state.dart';
import '../../logic/presentation/chat_page.dart';

class VisionView extends StatefulWidget {
  const VisionView({super.key});

  @override
  State<VisionView> createState() => _VisionViewState();
}

class _VisionViewState extends State<VisionView> {
  @override
  void initState() {
    super.initState();
    context.read<LogicBloc>().add(const FetchSuggestions('vision'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 140.0,
            floating: false,
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
                  Icon(LucideIcons.scanFace, color: AppColors.accentPrimary, size: 20),
                  const SizedBox(width: 8),
                  const Text(
                    'VISION SPACE',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2,
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

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'COHERENCE ENGINE',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.accentPrimary, letterSpacing: 2),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Translate Vision into\nSovereign Reality',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white, height: 1.1),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Interact with the QSI Vision Engine to design, simulate, and architect future-coherent systems.',
                    style: TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.6),
                  ),
                ],
              ),
            ),
          ),

          // Suggestions Section
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: BlocBuilder<LogicBloc, LogicState>(
                builder: (context, state) {
                  if (state.suggestions.isEmpty) return const SizedBox.shrink();
                  
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'ACTIVE PROMPTS',
                        style: TextStyle(color: AppColors.textTertiary, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
                      ),
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 8,
                        runSpacing: 12,
                        children: state.suggestions.map((suggestion) {
                          return GestureDetector(
                            onTap: () => _navigateToVisionChat(suggestion),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: AppColors.bgSecondary,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: AppColors.borderSubtle),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(LucideIcons.sparkles, size: 14, color: AppColors.accentPrimary),
                                  const SizedBox(width: 8),
                                  Text(
                                    suggestion,
                                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  );
                },
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: GestureDetector(
                onTap: () => _navigateToVisionChat(null),
                child: Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: AppColors.bgSecondary.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppColors.borderSubtle),
                  ),
                  child: Column(
                    children: [
                      Icon(LucideIcons.messageSquare, color: AppColors.accentPrimary, size: 48),
                      const SizedBox(height: 20),
                      const Text(
                        'OPEN VISION CONSOLE',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 1),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Start a custom architectural dialogue',
                        style: TextStyle(color: AppColors.textTertiary, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }

  void _navigateToVisionChat(String? prompt) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ChatPage(
          moduleName: 'vision',
          initialMessage: prompt,
        ),
      ),
    );
  }
}
