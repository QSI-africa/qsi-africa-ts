import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import 'user_model.dart';

class AuthRepository {
  final ApiClient apiClient;
  final _storage = const FlutterSecureStorage();

  AuthRepository({required this.apiClient});

  Future<UserModel> login(String email, String password) async {
    try {
      final response = await apiClient.post(
        ApiConstants.login,
        data: {'email': email, 'password': password},
      );

      final token = response.data['token'];
      final userData = response.data['user'];

      await _storage.write(key: 'auth_token', value: token);
      
      return UserModel.fromJson(userData);
    } catch (e) {
      rethrow;
    }
  }

  Future<UserModel> register(Map<String, dynamic> data) async {
    try {
      final response = await apiClient.post(ApiConstants.register, data: data);
      final token = response.data['token'];
      final userData = response.data['user'];

      await _storage.write(key: 'auth_token', value: token);
      
      return UserModel.fromJson(userData);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'auth_token');
  }

  Future<UserModel?> getCurrentUser() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return null;

      final response = await apiClient.get(ApiConstants.profile);
      return UserModel.fromJson(response.data);
    } catch (e) {
      return null;
    }
  }
}
