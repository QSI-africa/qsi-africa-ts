import 'package:equatable/equatable.dart';

class UserModel extends Equatable {
  final String id;
  final String email;
  final String? name;
  final String? role;
  final String? avatarUrl;
  final bool isOnboarded;

  const UserModel({
    required this.id,
    required this.email,
    this.name,
    this.role,
    this.avatarUrl,
    this.isOnboarded = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'],
      role: json['role'],
      avatarUrl: json['avatarUrl'],
      isOnboarded: json['isOnboarded'] ?? 
                  (json['frequencyScans'] != null && 
                  (json['frequencyScans'] as List).isNotEmpty),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'avatarUrl': avatarUrl,
      'isOnboarded': isOnboarded,
    };
  }

  @override
  List<Object?> get props => [id, email, name, role, avatarUrl, isOnboarded];
}
