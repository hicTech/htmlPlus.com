window.dyn_modules = {};

function solveDynModules($node){
	
    	if ( $node.find('[data-h-modules-role="dyn_module"]').size() == 0 )
    		return false;



    	
        $node.find('[data-h-modules-role="dyn_module"]').each(function(){



            var $node = $(this);
            var module_id = $node.attr("data-h-module-id");
            var template_name = $node.attr("data-h-template-name");
            var opts = ( _.is($node.attr("data-h-opts")) )? $node.attr("data-h-opts") : '{}';

            var template_modules = window.dyn_modules[template_name];
            template_modules = _.isObject(template_modules) ? _.keys(template_modules) : null;
            
            if(_.isNotEmptyArray(template_modules)){


            	
            	var copy_module = window.dyn_modules[template_name][template_modules[0]];
            	if(_.isFunction(copy_module.resetModule))
            		copy_module.resetModule();
            		
            	var this_module = {};
        		_.each(copy_module, function(copy_val, copy_key){
        			try{
                    	this_module[copy_key] = _.deepClone(copy_val);
        			}catch(err){
                		alert("Errore nel clone della proprieta' "+copy_key+" modulo "+template_name+": "+err);
                	}
        		}, this);
            	
            	window.dyn_modules[template_name][module_id] = this_module;
            	var $html = $("<div data-h-template-name='"+template_name+"' data-h-module-id='"+module_id+"'></div>");
            	if(_.isNotEmptyString(this_module.res_html)){
            		$html.append(this_module.res_html);
            	}
            	
            	

            	
            	$node.append($html);
            	

            	
            	
            	// creo la funzione che mi ritorna il nodo html del modulo
                this_module.$ = function(){return $html;}
                
                
                // creo la funzione che mi ritorna le opts del modulo
                var jsonOpts = _.parse(opts);
                this_module.opts = function(){return jsonOpts;}

                // creo la funzione che mi ritorna l'id del modulo
                this_module.getId = function(){return module_id;}
                
                
                var is_dyn = _.isFunction(this_module.und_temp);
                
                
                
            	if(is_dyn){
            		
            		this_module.dynHtml = function(){ return this_module.und_temp({ module: this_module }); };
            		
            		//console.time("dyno-ifoooooo");
                    var dhtml = this_module.dynHtml();
                    //console.timeEnd("dyno-ifoooooo");
	            	$html.append(dhtml);
	            	 
            	}
            	else{
            		//console.time("dyno-else");
            		$html.append(copy_module.$().html());

            		//console.timeEnd("dyno-else");
            	}
            	
            	
            	// creo la funzione che mi ritorna l'array degli id dei mooduli figli di primo livello
                var arr = [];
                
                $node.find('[data-h-modules-role="dyn_module"]').each(function(){
                    arr.push($(this).attr("data-h-module-id"));
                });
                
                window.dyn_modules[template_name][module_id].getChildModules =function(){
                    return arr;
                };
                
                
                
                try{
                	// invoco l'on del modulo
                    window.dyn_modules[template_name][module_id].js_on(jsonOpts);
                }
                catch(err){
                    var txt="Problema nell'on del template:" +template_name+ "\n";
                    txt+="Error description: " + err.message;
                    console.log(txt);
                }
               
                
                
                // verifico se nel modulo ci siano altri moduli dinamici
                var nested_modules = $html.find('[data-h-modules-role="dyn_module"]');
                
                if( nested_modules.size() != 0 ){
                    //var ms = _.timestamp();
                	
                	solveDynModules($html);
                    //_.log("Risolti "+nested_modules.size()+" sotto-moduli di modulo "+template_name+" ("+module_id+") in "+(_.timestamp()-ms)+" ms");
                }
                //else _.log("Risolto modulo "+template_name+" ("+module_id+"), senza sottonodi");
                
                
            }
            else{
	            //$node.removeAttr("data-h-module-id").removeAttr("data-h-template-name").removeAttr("data-h-opts");


            	
	            $.get("MODULES/"+template_name+".html", function(data) {
	            	
	                var $html = $("<div data-h-template-name='"+template_name+"' data-h-module-id='"+module_id+"'>"+data+"</div>");
	                var jsonOpts = _.parse(opts);

                    // se nel modulo c'è un tag <style rel='stylesheet/less'> questo viene compilato da grunt ed eliminato
                    $html.find("style[rel='stylesheet/less']").remove();


	                $node.append($html);

	                addModule(template_name,module_id,moduleFunctions);
	                
	                var this_module = window.dyn_modules[template_name][module_id];
                	
	
	                // creo la funzione che mi ritorna il nodo html del modulo
	                this_module.$ = function(){return $html;}
	
	                // creo la funzione che mi ritorna le opts del modulo
	                this_module.opts = function(){return jsonOpts;}
	
	                // creo la funzione che mi ritorna l'id del modulo
	                this_module.getId = function(){return module_id;}
	
	                // creo la funzione che mi ritorna il nome delle template
	                this_module.getTemplate = function(){return template_name;}

                    // creo la funzione che mi ritorna il registro degli scrollable presenti nel modulo
                    this_module.scrollsRegister = {};
                    this_module.scrollers = function(key,$scroller){
                         if(_.is($scroller) && _.is(key))
                             this_module.scrollsRegister[key] = $scroller;
                         else
                            return this_module.scrollsRegister;
                    }

                    this_module.refreshScrollers = function(){

                        _.each(this_module.scrollers(),function(scroller){
                           scroller.refresh();
                        });
                    }
	
	                // creo la funzione che crea lo scroller interno al modulo
	                this_module.createScroller = function(){
	                	
	                    // TODO: qui invece del setTimeout, il createScroller va invocato quando tutti i sottomoduli del modulo sono stati printati e hanno occupato i loro ingombri
	                   
	                	var that = this;
	                    var $that = that.$();
	
	                    if( _.is(that.$scroll) )
	                        that.$scroll = null;


	
	                    setTimeout(function(){
	                        var $wrapper = $that.find(".wrapper");

	                        $wrapper.each(function(){

	                            var $wrapper_id = _.id("wrapper");
	                            $(this).attr("id",$wrapper_id);

	                            var $scroll = new iScroll($wrapper_id , { useTransition:true});
                                that.scrollers($wrapper_id,$scroll);


	                            /* questo sembra risolvere il problema dello scroll sugli input */
	                            $scroll.options.onBeforeScrollStart = function(e) {
	                                var target = e.target;

	                                while (target.nodeType != 1) target = target.parentNode;
	                                if ( target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA'){
	                                    e.preventDefault();
	                                }
	                            }

	                            $(this).resize(function(){
	                                console.log("refesh");
	                                $scroll.refresh();
	                            });
	                        })
	
	                    },400);
	                    
	
	                };
	
	                
	                try{
	                	// creo la funzione che mi ritorna il template underscore
	                    var $template = $html.find("textarea[data-role='template']");
	                    var is_dyn = $template.size()>0;
	                	if(is_dyn){
	                		$template.each(function(){
		                    	var _template = $(this).val();
		                    	this_module.und_temp = _.template(_template);
		                        this_module.dynHtml = function(){ return this_module.und_temp({ module: this_module }); };
		                        $(this).remove();
		                    });
	                    	
	                    	this_module.res_html = $html.html();
	                    	var dhtml = this_module.dynHtml();



	                    	$html.append(dhtml);
	                	}
	                	
	                	
	                	// creo la funzione che mi ritorna l'array degli id dei mooduli figli di primo livello
		                var arr = [];
		                $node.find('[data-h-modules-role="dyn_module"]').each(function(){
		                    arr.push($(this).attr("data-h-module-id"));
		                });
		                window.dyn_modules[template_name][module_id].getChildModules =function(){
		                    return arr;
		                };
		
		                
	                    // invoco l'on del modulo
	                    window.dyn_modules[template_name][module_id].js_on(jsonOpts);
	                }
	                catch(err){
	                    var txt="Problema nell'on del template:" +template_name+ "\n";
	                    txt+="Error description: " + err.message;
	                    console.log(txt);
	                }
	
	                // rimuovo il tag script per non affollare il DOM
	                $html.find("script").remove();
	
	                // verifico se nel modulo ci siano altri moduli dinamici
	                var nested_modules = $html.find('[data-h-modules-role="dyn_module"]');
	                
	                if( nested_modules.size() != 0 ){
	                    //var ms = _.timestamp();
	                	
	                	
	                	solveDynModules($html);
	                	
	                    //_.log("Risolti "+nested_modules.size()+" sotto-moduli di modulo "+template_name+" ("+module_id+") in "+(_.timestamp()-ms)+" ms");
	                }
	                //else _.log("Risolto modulo "+template_name+" ("+module_id+"), senza sottonodi");
	            });
            }
            
        });
    
    
}



function addModule(template_name,module_id,moduleFunctions){
    if(window.dyn_modules[template_name] == undefined)
        window.dyn_modules[template_name] = {};
    if(window.dyn_modules[template_name][module_id] == undefined)
        window.dyn_modules[template_name][module_id] = {};
    window.dyn_modules[template_name][module_id] = moduleFunctions;
}

                                                                                                                                                       
function getModule(module_idOrModuleOr$moduleOrSome$elem){
	var t_name = null;
	var m_id = null;
    if(is$Module(module_idOrModuleOr$moduleOrSome$elem)){
        t_name =  module_idOrModuleOr$moduleOrSome$elem.closest('[data-h-modules-role="dyn_module"]').attr("data-h-template-name");
        m_id =  module_idOrModuleOr$moduleOrSome$elem.closest('[data-h-modules-role="dyn_module"]').attr("data-h-module-id");
    }
    else{
        var mod_id = ( _.isString(module_idOrModuleOr$moduleOrSome$elem) ) ? module_idOrModuleOr$moduleOrSome$elem
                                                                : module_idOrModuleOr$moduleOrSome$elem.$().closest('[data-h-modules-role="dyn_module"]').attr("data-h-module-id");

        _.each(_.keys(window.dyn_modules),function(template_name){
            _.each(_.keys(window.dyn_modules[template_name]),function(module_id){
                if(module_id == mod_id){
                    t_name = template_name;
                    m_id = module_id;
                }
            })
        })
    }

    return (_.isNotEmptyString(t_name) && _.isNotEmptyString(m_id)) ? window.dyn_modules[t_name][m_id] : null;
}



function getParentModule(elem){
   var current_module = getModule(elem);
   var parent_module_id= current_module.$().parents('[data-h-modules-role="dyn_module"]').eq(1).attr("data-h-module-id");
   return getModule(parent_module_id);
}


function getAllModule(template_name){
    var arr = [];
    _.each(window.dyn_modules[template_name],function(module){
       arr.push(module);
    });
    return arr;
};

function isLever(module){
   if( module.$().attr("data-h-template-name") == "levers_group_widget" )
        return true;
   return false;
}

function is$Module(elem){

     if(_.isString(elem))
        return false;
     else{
         if(elem.js_on == undefined)
            return true;
         else
            return false;
     }

}








/*

 window.dyn_modules = {

        "template_name" : {
            "module_id" :  moduleFunctions,
            "module_id" :  moduleFunctions
        },

        "template_name" : {
            "module_id" :  moduleFunctions
        }
        .
        .
        .
        .

 }

*/



