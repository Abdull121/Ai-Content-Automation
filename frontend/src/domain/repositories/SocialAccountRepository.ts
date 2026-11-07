import { SocialAccount } from "../entities/SocialAccount";
import { Platform } from "../entities/Platform";

export interface SocialAccountRepository {
  listAccounts(): Promise<SocialAccount[]>;
  connectAccount(platform: Platform): Promise<void>;
}
