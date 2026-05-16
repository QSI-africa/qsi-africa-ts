import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/api/api_client.dart';
import 'core/error/error_view.dart';
import 'core/notifications/notification_service.dart';
import 'core/socket/socket_manager.dart';
import 'features/auth/bloc/auth_bloc.dart';
import 'features/auth/bloc/auth_event.dart';
import 'features/auth/bloc/auth_state.dart';
import 'features/auth/data/auth_repository.dart';
import 'features/logic/bloc/logic_bloc.dart';
import 'features/auth/presentation/login_page.dart';
import 'features/auth/presentation/register_page.dart';
import 'features/auth/presentation/onboarding_page.dart';
import 'features/dashboard/presentation/dashboard_page.dart';
import 'features/portfolio/data/repositories/portfolio_repository.dart';
import 'features/finance/data/repositories/finance_repository.dart';
import 'features/portfolio/bloc/portfolio_bloc.dart';
import 'features/finance/bloc/finance_bloc.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Terminal Error Handling
  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    // Log to crashlytics in production
  };

  ErrorWidget.builder = (details) {
    return GlobalErrorView(errorDetails: details);
  };

  // Initialize Firebase and Notifications safely
  try {
    await Firebase.initializeApp();
    final notificationService = NotificationService();
    await notificationService.initialize();
  } catch (e) {
    debugPrint('Firebase initialization failed: $e');
    debugPrint('The app will continue without Firebase features. Please ensure google-services.json is present for Android or firebase_options.dart is configured.');
  }

  final apiClient = ApiClient();
  final authRepository = AuthRepository(apiClient: apiClient);
  final portfolioRepository = PortfolioRepository(apiClient);
  final financeRepository = FinanceRepository(apiClient);
  final socketManager = SocketManager();

  runApp(
    MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: authRepository),
        RepositoryProvider.value(value: portfolioRepository),
        RepositoryProvider.value(value: financeRepository),
        RepositoryProvider.value(value: apiClient),
        RepositoryProvider.value(value: socketManager),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (context) => AuthBloc(authRepository: authRepository)..add(AuthCheckRequested()),
          ),
          BlocProvider(
            create: (context) => LogicBloc(apiClient: apiClient),
          ),
          BlocProvider(
            create: (context) => PortfolioBloc(portfolioRepository),
          ),
          BlocProvider(
            create: (context) => FinanceBloc(financeRepository),
          ),
        ],
        child: const QSIApp(),
      ),
    ),
  );
}

class QSIApp extends StatelessWidget {
  const QSIApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'QSI Africa',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is Authenticated) {
            context.read<SocketManager>().connect();
          } else if (state is Unauthenticated) {
            context.read<SocketManager>().disconnect();
          }
        },
        child: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, state) {
            if (state is Authenticated) {
              if (state.user.isOnboarded) {
                return const DashboardPage();
              } else {
                return const OnboardingPage();
              }
            }
            if (state is Unauthenticated || state is AuthFailure || state is AuthInitial) {
              return const LoginPage();
            }
            return const Scaffold(
              body: Center(
                child: CircularProgressIndicator(),
              ),
            );
          },
        ),
      ),
    );
  }
}
