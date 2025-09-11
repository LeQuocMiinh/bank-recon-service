import { openAPI, zodValidator } from '@packages/zod-validator';
import { Hono } from 'hono';
import { DetailTransactionDto, ListTransactionDto, LoginDto, RegisterDto, UserMetadataDto } from '../dtos';
import { login, register } from '../modules/authorization/authorization.controller';
import { GetDetailTransactionResponse, ImportTransactionResponse, ListTransactionResponse, LoginResponse, RegisterResponse } from '../responses';
import { ROUTES } from '../route';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getTransactionDetail, importTransactions, listTransactions } from '../modules/transaction/transaction.controller';
import { validateCSVRequest } from '../utils';

const bankReconRouter = new Hono();

bankReconRouter.post(
	ROUTES.author.register,
	openAPI({
		operationId: ROUTES.author.register,
		header: UserMetadataDto,
		request: RegisterDto,
		response: RegisterResponse,
		events: [],
		description: 'Register account',
		dataSource: 'json',
	}),
	zodValidator(RegisterDto, 'json', 'data'),
	register,
);

bankReconRouter.post(
	ROUTES.author.login,
	openAPI({
		operationId: ROUTES.author.login,
		header: UserMetadataDto,
		request: LoginDto,
		response: LoginResponse,
		events: [],
		description: 'Login',
		dataSource: 'json',
	}),
	zodValidator(LoginDto, 'json', 'data'),
	login,
);

bankReconRouter.post(
	ROUTES.transaction.import,
	authMiddleware,
	validateCSVRequest,
	openAPI({
		operationId: ROUTES.transaction.import,
		header: UserMetadataDto,
		response: ImportTransactionResponse,
		events: [],
		description: 'Import transaction',
		dataSource: 'json',
	}),
	importTransactions,
);

bankReconRouter.get(
	ROUTES.transaction.list,
	authMiddleware,
	openAPI({
		operationId: ROUTES.transaction.list,
		header: UserMetadataDto,
		request: ListTransactionDto,
		response: ListTransactionResponse,
		events: [],
		description: 'List transaction',
		dataSource: 'query',
	}),
	zodValidator(ListTransactionDto, 'query', 'data'),
	listTransactions,
);

bankReconRouter.get(
	ROUTES.transaction.detail,
	authMiddleware,
	openAPI({
		operationId: ROUTES.transaction.detail,
		header: UserMetadataDto,
		request: DetailTransactionDto,
		response: GetDetailTransactionResponse,
		events: [],
		description: 'Get detail transaction',
		dataSource: 'query',
	}),
	zodValidator(DetailTransactionDto, 'query', 'data'),
	getTransactionDetail,
);

export default bankReconRouter;
