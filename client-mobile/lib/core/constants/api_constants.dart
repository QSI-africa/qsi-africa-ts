class ApiConstants {
  static const String baseUrl = 'https://api.qsi.africa/api';
  
  // Auth endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String profile = '/auth/me';
  static const String onboarding = '/auth/onboarding';
  
  // Feature endpoints
  static const String mobility = '/mobility';
  static const String lab = '/lab';
  static const String concepts = '/concepts';
  static const String tv = '/tv';
  static const String logic = '/logic';
  static const String network = '/network';
  static const String profiles = '/profiles';
  static const String requests = '/requests';
  static const String invoices = '/invoices';
}
