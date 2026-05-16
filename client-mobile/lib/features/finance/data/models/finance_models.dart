import 'package:equatable/equatable.dart';

class Wallet extends Equatable {
  final double balance;
  final double totalInvested;
  final int activeAssets;
  final String currency;

  const Wallet({
    required this.balance,
    required this.totalInvested,
    required this.activeAssets,
    this.currency = 'USD',
  });

  factory Wallet.fromJson(Map<String, dynamic> json) {
    return Wallet(
      balance: double.tryParse(json['balance']?.toString() ?? '0') ?? 0.0,
      totalInvested: double.tryParse(json['totalInvested']?.toString() ?? '0') ?? 0.0,
      activeAssets: json['activeAssets'] ?? 0,
      currency: json['currency'] ?? 'USD',
    );
  }

  @override
  List<Object?> get props => [balance, totalInvested, activeAssets, currency];
}

class Transaction extends Equatable {
  final String id;
  final String title;
  final double amount;
  final DateTime date;
  final String type; // 'credit' or 'debit'
  final String status;

  const Transaction({
    required this.id,
    required this.title,
    required this.amount,
    required this.date,
    required this.type,
    required this.status,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'] ?? '',
      title: json['title'] ?? 'Strategic Transaction',
      amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0.0,
      date: DateTime.tryParse(json['date']?.toString() ?? '') ?? DateTime.now(),
      type: json['type'] ?? 'debit',
      status: json['status'] ?? 'completed',
    );
  }

  @override
  List<Object?> get props => [id, title, amount, date, type, status];
}

class Invoice extends Equatable {
  final String id;
  final String invoiceNumber;
  final double totalAmount;
  final DateTime issueDate;
  final String status;

  const Invoice({
    required this.id,
    required this.invoiceNumber,
    required this.totalAmount,
    required this.issueDate,
    required this.status,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id'] ?? '',
      invoiceNumber: json['invoiceNumber'] ?? 'INV-0000',
      totalAmount: double.tryParse(json['totalAmount']?.toString() ?? '0') ?? 0.0,
      issueDate: DateTime.tryParse(json['issueDate']?.toString() ?? '') ?? DateTime.now(),
      status: json['status'] ?? 'PENDING',
    );
  }

  @override
  List<Object?> get props => [id, invoiceNumber, totalAmount, issueDate, status];
}
