const express = require('express');
const router = express.Router();
const {searchID} = require("./results");
const con = require('../mysqlConnection')

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}


router.get('/:common_id', async (req, res) => {
    let root_id;
    let entry;

    if(req.params.common_id === "random"){

        // grabbing the actual entry from rt_master 
        [[entry], ] = await con.promise().execute(
                'select * from rt_master order by rand() limit 1;'
        );
        root_id = entry.rt_master_id;
        res.redirect("/dictionary/"+root_id)

    } else {

        root_id = req.params.common_id;

        // grabbing the actual entry from rt_master 
        [[entry], ] = await con.promise().execute(
                'select * from rt_master where rt_master_id=?;',
            [root_id]
        );

    }

    if(!entry){
        res.redirect("/404")
    }

    // alternate forms are separated by slashes
    let forms = entry.rt_shape.split("/");
    entry.rt_shape = forms[0];
    entry.alternates = forms.slice(1);

    if(entry.rt_relationship && entry.rt_relationship.includes("_v")){
        entry.variant_id = entry.rt_relationship.replace("_v","");
        [[entry.variant_shape], ] = await con.promise().execute(
            'select * from rt_master where rt_master_id=?;',
        [entry.variant_id]
    );
    }


    // get the attested reflexes
    // this query is really bad but it works and is still faster than mongodb
    let [dictionary, ] = await con.promise().execute(
        `
            select lex_ref_link.*, rt_ref_link.*, lang_abbrev_master.*, lang_master.*, top_branch_master.* 
            from lex_ref_link 
            left join rt_ref_link on 
            (
                rt_ref_link.ref_rt_index=lex_ref_link.ref_rt_index
                and 
                rt_ref_link.ref_id=lex_ref_link.ref_id
            ) or (
                rt_ref_link.rt_ref_link_id=lex_ref_link.rt_ref_link_id 
            )
            left join lang_abbrev_master on lex_ref_link.orig_lang_abbrev=lang_abbrev_master.source_abbrev
            collate utf8mb3_general_ci
            left join lang_master on lang_abbrev_master.eng_abbrev=lang_master.eng_abbrev
            collate utf8mb3_general_ci
            left join ref_master on lex_ref_link.ref_id=ref_master.ref_id
            left join branch_master on lang_master.Glottolog_lang=branch_master.\`Language\`
            left join branch_master as top_branch_master on top_branch_master.\`Language\`=branch_master.top_branch 
            where rt_ref_link.rt_master_id=?
            and reflex is not null
            ; 
        `,
        [root_id]
    );

    entry.attested_in = [...new Set(dictionary.map(r => r.Lang_name))]

    console.log(dictionary)

    // console.log(dictionary)

    dictionary = dictionary.map( e => {
        if(!e.full_language_name){
            e.full_language_name = e.orig_lang_abbrev
        }
        return e
    })

    // dictionary split up by sources
    let sources = {}
    for(reflex of dictionary){
        if( !(reflex.ref_id in sources) ){
            let [[ref_info], ] = await con.promise().execute(
                'select * from ref_master where ref_id=?', 
                [reflex.ref_id]
            );
            ref_info.reflexes=[]
            ref_info.rt_gloss = reflex.rt_gloss_eng ? reflex.rt_gloss_eng : reflex.rt_gloss_orig
            ref_info.rt_shape = reflex.rt_shape
            ref_info.questionable_root = Boolean(parseInt(reflex.questionable_root)) 
            ref_info.questionable_meaning = Boolean(parseInt(reflex.questionable_meaning)) 
            sources[reflex.ref_id] = ref_info;
        }

        sources[reflex.ref_id].reflexes.push(reflex)
    }
    // console.log(Object.keys(sources))

    // // sort individual sources
    // for(s in sources){
    //     if( sources[s].some( (r) => r.category ) ){
    //         sources[s].sort( (r1, r2) => {r1.category > r2.category} )
    //     } else { 
    //         // TODO: sort by language family
    //     }
    // }

    res.render('dictionary', {entry, sources});
});

async function getLangsFromAbbrevs(abbrevs){
    // start of query
    let query = `
    select full_language_name, matched_by from (
    select *,
    case 
    `

    // different case for every regexp
    for( ab of new Set(abbrevs) ) {
        let escapedStr = ab.replace(/\s/, '').replace('.', '');
        query += `when source_abbrev regexp "(^|,)${escapedStr}\\\\.?($|,)" then "${ab}"\n`;
    }

    // end of query
    query += `
        else null
        end as matched_by
        from lang_abbrev_master
    ) as t
    where matched_by is not null;
    `

    let [results,_] = await con.promise().execute(query);
    
    // turn into a dict for easier processing
    let langDict = {};
    results.map( r => { langDict[r.matched_by] = r.full_language_name });
    return langDict;
}

module.exports = router;