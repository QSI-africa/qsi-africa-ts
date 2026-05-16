import '../models/portfolio_item.dart';
import '../../../../core/api/api_client.dart';

class PortfolioRepository {
  final ApiClient _apiClient;

  PortfolioRepository(this._apiClient);

  Future<List<PortfolioItem>> getConcepts({String category = 'all'}) async {
    try {
      final response = await _apiClient.get('/submit/concepts', queryParameters: {'category': category});
      if (response.data is List) {
        return (response.data as List)
            .map((json) => PortfolioItem.fromJson(json, PortfolioType.concept))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  Future<List<PortfolioItem>> getDemos({String category = 'all'}) async {
    try {
      final response = await _apiClient.get('/submit/demos', queryParameters: {'category': category});
      if (response.data is List) {
        return (response.data as List)
            .map((json) => PortfolioItem.fromJson(json, PortfolioType.demo))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  Future<PortfolioItem> getConceptDetail(String id) async {
    try {
      final response = await _apiClient.get('/submit/concepts/$id');
      return PortfolioItem.fromJson(response.data, PortfolioType.concept);
    } catch (e) {
      rethrow;
    }
  }

  Future<PortfolioItem> getDemoDetail(String id) async {
    try {
      final response = await _apiClient.get('/submit/demos/$id');
      return PortfolioItem.fromJson(response.data, PortfolioType.demo);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> submitEngagement(Map<String, dynamic> data) async {
    try {
      await _apiClient.post('/submit/pilot-engagement', data: data);
    } catch (e) {
      rethrow;
    }
  }
}
