const validationHandler = require('../validations/validationHandler');
const { Project } = require('../models/projectModel');
const ErrorResponse = require('../utils/errorResponse');
const { Levels, Logger } = require('../services/loggerService');

const collectionName = Project.collection.collectionName;

exports.indexProject = async (req, res, next) => {
    
    // Valida los datos del pedido
    let logMessage = `${req.method} (${req.originalUrl}) | Retrieve projects from ${collectionName}`;  
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
        // Filtra por Name si esta definido
        if(req.query.name) {
            AggregationArray.push({ $match : { Name: req.query.name }});
        }
        // Ordena por Name
        AggregationArray.push({ $sort : { Name: 1 }});
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
            let result = await Project.aggregate(AggregationArray);
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
            Logger.Save(Levels.Info, 'Database', `${response.Data.length} projects retrieved from ${collectionName}`, req.user._id);
            res.send(response);     
        }
        else
        {
            // Sin paginacion
            let result = await Project.aggregate(AggregationArray);
            Logger.Save(Levels.Info, 'Database', `${result.length} projects retrieved from ${collectionName}`, req.user._id);
            res.send({ Success: true, Data: result });
        }

    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Error retrieving projects from ${collectionName} -> ${error.message}`, req.user._id);
        return next(error);
    }
};

exports.showProject = async (req, res, next) => {
    
    // Valida los datos del pedido
    let logMessage = `${req.method} (${req.originalUrl}) | Retrieve project ${req.params.projectId} from ${collectionName}`;  
    try { 
        validationHandler(req);
    }
    catch (error) {
        logMessage += ' -> Validation Error';
        Logger.Save(Levels.Warning, 'Api', logMessage, req.user._id); 
        return next(new ErrorResponse(error.message, error.statusCode, error.validation));
    }
    Logger.Save(Levels.Debug, 'Api', logMessage, req.user._id); 
    
    // Obtiene y devuelve los datos de la compania
    try {
        let project;
        if(req.query.populate) {
            project = await Project.findOne({ _id: req.params.projectId}).populate('Users');
        } else {
            project = await Project.findOne({ _id: req.params.projectId});
        }
        if(!project) {
            Logger.Save(Levels.Info, 'Database', `Project ${req.params.projectId} not found in ${collectionName}`, req.user._id);
            return next(new ErrorResponse('Project not found', 404));
        }
        Logger.Save(Levels.Info, 'Database', `Project ${req.params.projectId} retrieved from ${collectionName}`, req.user._id);
        res.send( {Success: true, Data: project});

    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Error retrieving project ${req.params.projectId} from ${collectionName} -> ${error.message}`, req.user._id);
        return next(error);   
    }
};

exports.storeProject = async (req, res, next) => {
    
    // Valida los datos del pedido
    let logMessage = `${req.method} (${req.originalUrl}) | Store new project to ${collectionName}`;  
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
        const { Name, UsersId } = req.body;
        let project = await Project.create({ Name, UsersId });
        Logger.Save(Levels.Info, 'Database', `Project ${project._id} stored in ${collectionName}`, req.user._id);
        res.send({Success: true, Data: project });

    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Error storing project to ${collectionName} -> ${error.message}`, req.user._id);
        return next(error);
    }
};

exports.deleteProject = async (req, res, next) => {
    
    // Valida los datos del pedido
    let logMessage = `${req.method} (${req.originalUrl}) | Delete project ${req.params.projectId} from ${collectionName}`;  
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
        const project = await Project.findById(req.params.projectId);
        if(!project) {
            Logger.Save(Levels.Info, 'Database', `Project ${req.params.projectId} not found in ${collectionName}`, req.user._id);
            return next(new ErrorResponse('Project not found', 404));
        }
        await project.remove();
        Logger.Save(Levels.Info, 'Database', `Project ${req.params.projectId} deleted from ${collectionName}`, req.user._id);
        res.send( {Success: true, Data: []});

    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Error deleting project ${req.params.projectId} from ${collectionName} -> ${error.message}`, req.user._id);
        return next(error);   
    }
};

exports.updateProject = async (req, res, next) => {
    
    // Valida los datos del pedido
    let logMessage = `${req.method} (${req.originalUrl}) | Update project ${req.params.projectId} from ${collectionName}`;  
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
        const { Name, UsersId } = req.body;
        const project = await Project.findById(req.params.projectId);
        if(!project) {
            Logger.Save(Levels.Info, 'Database', `Project ${req.params.projectId} not found in ${collectionName}`, req.user._id);
            return next(new ErrorResponse('Project not found', 404));
        }
        if(Name) 
            project.Name = Name;
        if(UsersId) 
            project.UsersId = UsersId;
        await project.save();
        Logger.Save(Levels.Info, 'Database', `Project ${req.params.projectId} updated in ${collectionName}`, req.user._id);
        res.send( {Success: true, Data: project});

    } catch (error) {
        Logger.Save(Levels.Error, 'Database', `Error updating project ${req.params.userId} in ${collectionName} -> ${error.message}`, req.user._id);
        return next(error);   
    }
};