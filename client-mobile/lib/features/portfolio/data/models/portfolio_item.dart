import 'package:flutter/foundation.dart';

enum PortfolioType { concept, demo }

class StrategicMetric {
  final String label;
  final String value;
  final String icon; // Icon name string or ID
  final String color;

  StrategicMetric({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  factory StrategicMetric.fromJson(Map<String, dynamic> json) {
    return StrategicMetric(
      label: json['label'] ?? '',
      value: json['value'] ?? '',
      icon: json['icon'] ?? 'layers',
      color: json['color'] ?? '#10B981',
    );
  }
}

class PortfolioItem {
  final String id;
  final String title;
  final String shortDescription;
  final String? expandedView;
  final String category;
  final String? status;
  final String? image;
  final List<StrategicMetric> metrics;
  final PortfolioType type;
  final DateTime createdAt;

  PortfolioItem({
    required this.id,
    required this.title,
    required this.shortDescription,
    this.expandedView,
    required this.category,
    this.status,
    this.image,
    required this.metrics,
    required this.type,
    required this.createdAt,
  });

  factory PortfolioItem.fromJson(Map<String, dynamic> json, PortfolioType type) {
    var metricsList = json['metrics'] as List?;
    List<StrategicMetric> parsedMetrics = metricsList != null
        ? metricsList.map((m) => StrategicMetric.fromJson(m)).toList()
        : [];

    return PortfolioItem(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      shortDescription: json['shortDescription'] ?? '',
      expandedView: json['expandedView'],
      category: json['category'] ?? 'General',
      status: json['status'],
      image: json['image'],
      metrics: parsedMetrics,
      type: type,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}
