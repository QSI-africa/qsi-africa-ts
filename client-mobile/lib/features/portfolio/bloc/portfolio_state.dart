import 'package:equatable/equatable.dart';
import '../data/models/portfolio_item.dart';

enum PortfolioStatus { initial, loading, success, failure }

class PortfolioState extends Equatable {
  final PortfolioStatus status;
  final List<PortfolioItem> concepts;
  final List<PortfolioItem> demos;
  final PortfolioItem? selectedItem;
  final String category;
  final String? errorMessage;

  const PortfolioState({
    this.status = PortfolioStatus.initial,
    this.concepts = const [],
    this.demos = const [],
    this.selectedItem,
    this.category = 'all',
    this.errorMessage,
  });

  PortfolioState copyWith({
    PortfolioStatus? status,
    List<PortfolioItem>? concepts,
    List<PortfolioItem>? demos,
    PortfolioItem? selectedItem,
    String? category,
    String? errorMessage,
  }) {
    return PortfolioState(
      status: status ?? this.status,
      concepts: concepts ?? this.concepts,
      demos: demos ?? this.demos,
      selectedItem: selectedItem ?? this.selectedItem,
      category: category ?? this.category,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, concepts, demos, selectedItem, category, errorMessage];
}
