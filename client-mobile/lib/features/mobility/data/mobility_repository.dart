import 'package:qsi_client_mobile/core/api/api_client.dart';

class MobilityRepository {
  final ApiClient apiClient;

  MobilityRepository(this.apiClient);

  Future<List<dynamic>> getBroadcasts() async {
    final response = await apiClient.get('/mobility/broadcasts');
    return response.data;
  }

  Future<List<dynamic>> getMyVisits() async {
    final response = await apiClient.get('/mobility/my-visits');
    return response.data;
  }

  Future<void> requestSiteVisit(String projectId, String message) async {
    await apiClient.post('/mobility/site-visit', data: {
      'projectId': projectId,
      'message': message,
    });
  }

  Future<void> acceptVehicleHire(String requestId) async {
    await apiClient.post('/mobility/$requestId/accept');
  }
}
