import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const Color bgPrimary = Color(0xFF111A16);
  static const Color bgSecondary = Color(0xFF18241E);
  static const Color bgTertiary = Color(0xFF203128);
  
  static const Color accentPrimary = Color(0xFF10B981);
  static const Color accentPrimarySoft = Color(0x1F10B981); // 12% opacity
  static const Color accentPrimaryHover = Color(0xFF059669);
  
  static const Color successGreen = Color(0xFF22C55E);
  
  static const Color textPrimary = Color(0xFFF9FAFB);
  static const Color textSecondary = Color(0xFF9CA3AF);
  static const Color textTertiary = Color(0xFF6B7280);
  
  static const Color borderSubtle = Color(0x14FFFFFF); // 8% opacity
  static const Color borderLight = Color(0x1FFFFFFF); // 12% opacity
  
  static const Color glassBg = Color(0xCC18241E); // 80% opacity
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: AppColors.accentPrimary,
      scaffoldBackgroundColor: AppColors.bgPrimary,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.accentPrimary,
        secondary: AppColors.accentPrimary,
        surface: AppColors.bgSecondary,
        background: AppColors.bgPrimary,
      ),
      textTheme: GoogleFonts.outfitTextTheme(
        const TextTheme(
          displayLarge: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w900, letterSpacing: -1),
          displayMedium: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w800, letterSpacing: -0.5),
          bodyLarge: TextStyle(color: AppColors.textPrimary, fontSize: 16),
          bodyMedium: TextStyle(color: AppColors.textSecondary, fontSize: 14),
          labelLarge: TextStyle(color: AppColors.textTertiary, fontWeight: FontWeight.w900, letterSpacing: 1),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.bgPrimary,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: AppColors.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w900,
          letterSpacing: 1,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.transparent,
        selectedItemColor: AppColors.accentPrimary,
        unselectedItemColor: AppColors.textTertiary,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }
}
