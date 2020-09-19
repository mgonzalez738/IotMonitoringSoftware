const validationHandler = require('../validations/validationHandler');
const { Company } = require('../models/companyModel');
const ErrorResponse = require('../utils/errorResponse');
const { Levels, Logger } = require('../services/loggerService');

const collectionName = Company.collection.collectionName;

exports.indexCompany = async (req, res, next) => {
    
    // Valida los datos del pedido
    let logMessage = `${req.method} (${req.originalUrl}) | Retrieve companies from ${collectionName}`;  
    try { 
        validationHandler(req);
    }
    catch (error) {
        logMessage += ' -> Validation Error';
        Logger.Save(Levels.Warning, 'Api', logMessage, req.user._id); 
        return next(new ErrorResponse(error.message, error.statusCode, error.validation));
    }
    Logger.Save(Levels.Debug, 'Api', logMessage, req.user._id); 
    
    // Devuelve las companias
    try {
        let AggregationArray = [];
        // Filtra por ClientId
        if(req.user.ClientId) {
            AggregationArray.push({ $match : { ClientId: req.user.ClientId }});
        }   
        // Filtra por Name si esta definido
        if(req.query.name) {
            AggregationArray.push({ $match : { Name: req.query.name }});
        }
        // Ordena por Name
        AggregationArray.push({ $sort : { Name: 1, ClientId: 1}});
        // Oculta campo cliente
        AggregationArray.push({ $project : { ClientId:0 }});        
        // Aplica paginacion si esta definido limit o skip
        if(req.query.skip || req.query.limit)
        {
            // Con paginacion
            let facet1Array = [];
            if(req.query.skip) {
                facet1Array.push({ $skip : parseInt(req.query.skip) });
            }
            if(req.query.limit) {
                facet1Array.push({ $limit : parseInt(req.query.limit) });
            }
            // Facet 2: Count
            let facet2Array = [{ $count: "Total" }];
            // Ejecuta la consulta
            AggregationArray.push({ $facet: { Items: facet1Array, Count: facet2Array }}, { $project: { Items: 1, 'Pagination.Total': '$Count.Total'}}, { $unwind: '$Pagination.Total'});
            let result = await Company.aggregate(AggregationArray);
            // Completa la respuesta con informacion de paginacion
            var response = { Success: true, Pagination: { From: null, To: null}, Data: [] };
            if(result.length == 0) { // No hubo respuesta 
                response.Pagination.Retrieved = 0;
                response.Pagination.Total = 0;
            } else {
                response.Data =  result[0].Items;
                if(result[0].Items.length) {
                    response.Pagination.From = (req.query.skip) ? Number(req.query.skip) + 1 : 1;
                    response.Pagination.To = (req.query.limit) ? response.Pagination.From + Number(req.query.limit) - 1 : result[0].Pagination.Total;
                    if((response.Pagination.To) && (response.Pagination.To > result[0].Pagination.Total))
                        response.Pagination.To = result[0].Pagination.Total;
                }
                response.Pagination.Retrieved = result[0].Items.length;
                response.Pagination.Total = result[0].Pagination.Total;
            } 
            Logger.Save(Levels.Info, 'Database', `${response.Data.length} companies retrieved from ${collectionName}`, req.user._id);
            res.send(response);     
        }
        else
        {
            // Sin paginacion
            let result = await Company.aggregate(AggregationArray);
            Logger.Save(Levels.Info, 'Database', `${result.length} companies retrieved from ${collectionName}`, req.user._id);
            res.send({ Success: true, Data: result });
        }

    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Error retrieving companies from ${collectionName} -> ${error.message}`, req.user._id);
        return next(error);
    }
};

exports.showCompany = async (req, res, next) => {
    
    // Valida los datos del pedido
    let logMessage = `${req.method} (${req.originalUrl}) | Retrieve company ${req.params.companyId} from ${collectionName}`;  
    try { 
        validationHandler(req);
    }
    catch (error) {
        logMessage += ' -> Validation Error';
        Logger.Save(Levels.Warning, 'Api', logMessage, req.user._id); 
        return next(new ErrorResponse(error.message, error.statusCode, error.validation));
    }
    Logger.Save(Levels.Debug, 'Api', logMessage, req.user._id); 
    
    // Obtiene y devuelve los datos 
    try {
        // Filtro de busqueda
        let filter = { _id: req.params.companyId };
        if(req.user.ClientId) {
            filter.ClientId = req.user.ClientId;
        }
        // Busqueda
        let company;
        if(req.query.populate) {
            company = await Company.findOne(filter).populate('Users');
        } else {
            company = await Company.findOne(filter);
        }
        if(!company) {
            Logger.Save(Levels.Info, 'Database', `Company ${req.params.companyId} not found in ${collectionName}`, req.user._id);
            return next(new ErrorResponse('Company not found', 404));
        }
        // Respeuesta
        Logger.Save(Levels.Info, 'Database', `Company ${req.params.companyId} retrieved from ${collectionName}`, req.user._id);
        res.send( {Success: true, Data: company});
    // Error
    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Error retrieving company ${req.params.companyId} from ${collectionName} -> ${error.message}`, req.user._id);
        return next(error);   
    }
};

exports.storeCompany = async (req, res, next) => {
    
    // Valida los datos del pedido
    let logMessage = `${req.method} (${req.originalUrl}) | Store new company to ${collectionName}`;  
    try { 
        validationHandler(req);
    }
    catch (error) {
        logMessage += ' -> Validation Error';
        Logger.Save(Levels.Warning, 'Api', logMessage, req.user._id); 
        return next(new ErrorResponse(error.message, error.statusCode, error.validation));
    }
    Logger.Save(Levels.Debug, 'Api', logMessage, req.user._id); 
    
    // Crea y guarda el usuario
    try {
        const { Name } = req.body;
        const ClientId = req.clientId;
        let company = await Company.create({ Name, ClientId });
        company = await Company.findOne({_id: company._id});
        Logger.Save(Levels.Info, 'Database', `Company ${company.id} stored in ${collectionName}`, req.user._id);
        res.send({Success: true, Data: company });

    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Error storing company to ${collectionName} -> ${error.message}`, req.user._id);
        return next(error);
    }
};

exports.deleteCompany = async (req, res, next) => {
    
    // Valida los datos del pedido
    let logMessage = `${req.method} (${req.originalUrl}) | Delete company ${req.params.companyId} from ${collectionName}`;  
    try { 
        validationHandler(req);
    }
    catch (error) {
        logMessage += ' -> Validation Error';
        Logger.Save(Levels.Warning, 'Api', logMessage, req.user._id); 
        return next(new ErrorResponse(error.message, error.statusCode, error.validation));
    }
    Logger.Save(Levels.Debug, 'Api', logMessage, req.user._id); 
    
    // Obtiene y elimina el usuario 
    try {
        const company = await Company.findById(req.params.companyId);
        if(!company) {
            Logger.Save(Levels.Info, 'Database', `Company ${req.params.companyId} not found in ${collectionName}`, req.user._id);
            return next(new ErrorResponse('Company not found', 404));
        }
        await company.remove();
        Logger.Save(Levels.Info, 'Database', `Company ${req.params.companyId} deleted from ${collectionName}`, req.user._id);
        res.send( {Success: true, Data: []});

    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Error deleting company ${req.params.companyId} from ${collectionName} -> ${error.message}`, req.user._id);
        return next(error);   
    }
};

exports.updateCompany = async (req, res, next) => {
    
    // Valida los datos del pedido
    let logMessage = `${req.method} (${req.originalUrl}) | Update company ${req.params.companyId} from ${collectionName}`;  
    try { 
        validationHandler(req);
    }
    catch (error) {
        logMessage += ' -> Validation Error';
        Logger.Save(Levels.Warning, 'Api', logMessage, req.user._id); 
        return next(new ErrorResponse(error.message, error.statusCode, error.validation));
    }
    Logger.Save(Levels.Debug, 'Api', logMessage, req.user._id);  
    
    // Obtiene y actualiza el usuario 
    try {
        const { Name } = req.body;
        const company = await Company.findById(req.params.companyId);
        if(!company) {
            Logger.Save(Levels.Info, 'Database', `Company ${req.params.companyId} not found in ${collectionName}`, req.user._id);
            return next(new ErrorResponse('Company not found', 404));
        }
        if(Name) 
            company.Name = Name;
        await company.save();
        Logger.Save(Levels.Info, 'Database', `Company ${req.params.companyId} updated in ${collectionName}`, req.user._id);
        res.send( {Success: true, Data: company});

    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Error updating company ${req.params.userId} in ${collectionName} -> ${error.message}`, req.user._id);
        return next(error);   
    }
};