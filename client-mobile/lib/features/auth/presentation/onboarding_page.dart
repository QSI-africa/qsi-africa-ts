import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/api/api_client.dart';
import 'package:qsi_client_mobile/theme/app_theme.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  int _currentStep = 0;
  bool _isLoading = false;

  final _locationController = TextEditingController();
  final _beliefsController = TextEditingController();
  final _backgroundController = TextEditingController();
  final _visionController = TextEditingController();
  final _challengesController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _locationController.dispose();
    _beliefsController.dispose();
    _backgroundController.dispose();
    _visionController.dispose();
    _challengesController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep == 1) {
      if (_locationController.text.isEmpty || _beliefsController.text.isEmpty || _backgroundController.text.isEmpty) {
        return;
      }
    }
    if (_currentStep < 2) {
      setState(() => _currentStep++);
    } else {
      _finishOnboarding();
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    }
  }

  Future<void> _finishOnboarding() async {
    setState(() => _isLoading = true);
    try {
      final profileData = {
        'location': _locationController.text.trim(),
        'personalBeliefs': _beliefsController.text.trim(),
        'background': _backgroundController.text.trim(),
        'lifeVision': _visionController.text.trim(),
        'challenges': _challengesController.text.trim(),
      };

      await context.read<ApiClient>().post('/onboarding/profile', data: profileData);
      
      if (mounted) {
        // Refresh auth state to reflect completed onboarding
        context.read<AuthBloc>().add(AuthCheckRequested());
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Synchronization failed: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: Stack(
        children: [
          // Background Decorative Zap
          Positioned(
            top: MediaQuery.of(context).size.height * 0.2,
            left: 0,
            right: 0,
            child: Icon(
              LucideIcons.zap,
              size: 400,
              color: AppColors.accentPrimary.withOpacity(0.03),
            ),
          ),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
              child: Column(
                children: [
                  // Progress Indicator
                  Row(
                    children: List.generate(3, (index) {
                      final isActive = index <= _currentStep;
                      return Expanded(
                        child: Container(
                          height: 4,
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            color: isActive ? AppColors.accentPrimary : Colors.white.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 48),

                  Expanded(
                    child: SingleChildScrollView(
                      child: Column(
                        children: [
                          if (_currentStep == 0) _buildStep0(),
                          if (_currentStep == 1) _buildStep1(),
                          if (_currentStep == 2) _buildStep2(),
                        ],
                      ),
                    ),
                  ),

                  // Navigation
                  Row(
                    children: [
                      if (_currentStep > 0)
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _isLoading ? null : _prevStep,
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: AppColors.accentPrimary.withOpacity(0.3)),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(LucideIcons.arrowLeft, size: 18, color: Colors.white),
                                SizedBox(width: 8),
                                Text('PREVIOUS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ),
                      if (_currentStep > 0) const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _nextStep,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.accentPrimary,
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                _currentStep == 2 ? 'ESTABLISH SYNC' : 'NEXT STEP',
                                style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1),
                              ),
                              const SizedBox(width: 8),
                              Icon(_currentStep == 2 ? LucideIcons.zap : LucideIcons.arrowRight, size: 18),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Cinematic Sync Overlay
          if (_isLoading)
            Container(
              color: Colors.black.withOpacity(0.9),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(
                      width: 60,
                      height: 60,
                      child: CircularProgressIndicator(
                        color: AppColors.accentPrimary,
                        strokeWidth: 2,
                      ),
                    ),
                    const SizedBox(height: 32),
                    const Text(
                      'SYNCHRONIZING WITH QSI',
                      style: TextStyle(
                        color: AppColors.accentPrimary,
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 4,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'ESTABLISHING COHERENCE PROTOCOL...',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.4),
                        fontSize: 8,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );

  }

  Widget _buildStep0() {
    return Column(
      children: [
        const SizedBox(height: 40),
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.accentPrimary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.accentPrimary.withOpacity(0.2)),
          ),
          child: Icon(LucideIcons.activity, color: AppColors.accentPrimary, size: 40),
        ),
        const SizedBox(height: 32),
        const Text(
          'FREQUENCY SCAN',
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.accentPrimary, letterSpacing: 3),
        ),
        const SizedBox(height: 16),
        const Text(
          'Initialize Your Profile',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white, height: 1.1),
        ),
        const SizedBox(height: 24),
        Text(
          "To provide you with coherent guidance, QSI first understands your unique energetic signature. This involves mapping your worldview, vision, and current challenges.",
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.6),
        ),
        const SizedBox(height: 40),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.03),
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: const Text(
            'EST. TIME: 2-3 MINUTES',
            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: AppColors.textTertiary, letterSpacing: 1),
          ),
        ),
      ],
    );
  }

  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'IDENTITY CALIBRATION',
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.accentPrimary, letterSpacing: 2),
        ),
        const SizedBox(height: 8),
        const Text(
          'Background & Beliefs',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white),
        ),
        const SizedBox(height: 32),
        _buildInputField(
          label: 'CURRENT LOCATION',
          controller: _locationController,
          hint: 'e.g. Harare, Zimbabwe',
        ),
        const SizedBox(height: 24),
        _buildInputField(
          label: 'WORLDVIEW & PHILOSOPHY',
          controller: _beliefsController,
          hint: 'What are your core beliefs about the world?',
          maxLines: 4,
        ),
        const SizedBox(height: 24),
        _buildInputField(
          label: 'TECHNICAL BACKGROUND',
          controller: _backgroundController,
          hint: 'Describe your educational trajectory.',
          maxLines: 4,
        ),
        const SizedBox(height: 40),
      ],
    );
  }

  Widget _buildStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'STRATEGIC MAPPING',
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.accentPrimary, letterSpacing: 2),
        ),
        const SizedBox(height: 8),
        const Text(
          'Vision & Challenges',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white),
        ),
        const SizedBox(height: 32),
        _buildInputField(
          label: 'STRATEGIC VISION',
          controller: _visionController,
          hint: 'What do you want to create in this cycle?',
          maxLines: 4,
        ),
        const SizedBox(height: 24),
        _buildInputField(
          label: 'OPERATIONAL OBSTACLES',
          controller: _challengesController,
          hint: 'What are your primary friction points?',
          maxLines: 4,
        ),
        const SizedBox(height: 40),
      ],
    );
  }

  Widget _buildInputField({
    required String label,
    required TextEditingController controller,
    required String hint,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.textTertiary, letterSpacing: 1.5),
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.03),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          child: TextField(
            controller: controller,
            maxLines: maxLines,
            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: TextStyle(color: Colors.white.withOpacity(0.2)),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.all(20),
            ),
          ),
        ),
      ],
    );
  }
}
