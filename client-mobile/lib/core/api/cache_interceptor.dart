import 'package:dio/dio.dart';

class CacheInterceptor extends Interceptor {
  final Map<String, _CacheEntry> _cache = {};
  static const Duration _cacheDuration = Duration(minutes: 5);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (options.method == 'GET') {
      final key = options.uri.toString();
      final entry = _cache[key];

      if (entry != null && !entry.isExpired) {
        print('📡 CACHE HIT: $key');
        return handler.resolve(entry.response);
      }
    }
    return super.onRequest(options, handler);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (response.requestOptions.method == 'GET') {
      final key = response.requestOptions.uri.toString();
      _cache[key] = _CacheEntry(response);
    }
    return super.onResponse(response, handler);
  }
}

class _CacheEntry {
  final Response response;
  final DateTime createdAt;

  _CacheEntry(this.response) : createdAt = DateTime.now();

  bool get isExpired => DateTime.now().difference(createdAt) > CacheInterceptor._cacheDuration;
}
