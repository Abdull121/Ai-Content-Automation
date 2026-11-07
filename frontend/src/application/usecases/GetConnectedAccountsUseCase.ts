import { SocialAccountRepository } from "@/domain/repositories/SocialAccountRepository";
import { SocialAccount } from "@/domain/entities/SocialAccount";

export class GetConnectedAccountsUseCase {
  constructor(private readonly accountRepository: SocialAccountRepository) {}

  execute(): Promise<SocialAccount[]> {
    return this.accountRepository.listAccounts();
  }
}
