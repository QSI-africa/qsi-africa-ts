import 'package:qsi_client_mobile/core/api/api_client.dart';
import '../models/finance_models.dart';

class FinanceRepository {
  final ApiClient _apiClient;

  FinanceRepository(this._apiClient);

  Future<Wallet> getWallet() async {
    final response = await _apiClient.get('/finance/wallet');
    return Wallet.fromJson(response.data);
  }

  Future<List<Transaction>> getTransactions() async {
    final response = await _apiClient.get('/finance/transactions');
    return (response.data as List).map((t) => Transaction.fromJson(t)).toList();
  }

  Future<List<Invoice>> getInvoices() async {
    final response = await _apiClient.get('/invoicing/my-invoices');
    return (response.data as List).map((i) => Invoice.fromJson(i)).toList();
  }
}
