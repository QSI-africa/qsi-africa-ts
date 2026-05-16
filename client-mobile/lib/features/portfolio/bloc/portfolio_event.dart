import 'package:equatable/equatable.dart';
import '../data/models/portfolio_item.dart';

abstract class PortfolioEvent extends Equatable {
  const PortfolioEvent();

  @override
  List<Object?> get props => [];
}

class FetchPortfolio extends PortfolioEvent {
  final String category;
  const FetchPortfolio({this.category = 'all'});

  @override
  List<Object?> get props => [category];
}

class ChangePortfolioCategory extends PortfolioEvent {
  final String category;
  const ChangePortfolioCategory(this.category);

  @override
  List<Object?> get props => [category];
}

class FetchItemDetail extends PortfolioEvent {
  final String id;
  final PortfolioType type;
  const FetchItemDetail(this.id, this.type);

  @override
  List<Object?> get props => [id, type];
}

class SubmitEngagement extends PortfolioEvent {
  final Map<String, dynamic> data;
  const SubmitEngagement(this.data);

  @override
  List<Object?> get props => [data];
}
