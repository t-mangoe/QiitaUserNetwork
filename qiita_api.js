// ネットワークのノード
var nodes;
// ネットワークのエッジ
var edges;
// vis.jsのネットワーク
var network;
// ネットワーク図でのノードの番号。重複しないようにユーザに割り当てる
var nodeIdNumber;
// ユーザとノード番号を対応づけるマップ
var nodeIdMap;

function getFollowerInfo(userId, depth){
    //フォローされているユーザの情報を取得
    $.ajax({
        url:'https://qiita.com/api/v2/users/' + userId + '/followers',
        success: function(data){
            var nodes_length = nodes.length;
            var userArray = [];
            $.each(data,function(index,val){
                // ノードとエッジに情報を追加
                var followerId = val.id;
                if(!(followerId in nodeIdMap)){
                    //ノードのIDを発行
                    nodeIdMap.followerId = nodeIdNumber;
                    nodeIdNumber++;
                    // ネットワーク拡大用のキューに追加
                    userArray.push(followerId);
                }
                nodes.add({id: nodeIdMap.followerId, label:followerId, shape:'image', image:val.profile_image_url});
                edges.add({from: nodeIdMap.followerId, to: nodeIdMap.userId, arrows: 'to'});
            });
            network.redraw();
            if(nodeIdNumber < 100){
                expandNetwork(userArray,depth);
            }
        },
        error: function(){
            alert("フォローされているユーザの取得中にエラーが発生しました");
        }
    });

}

function getFolloweeInfo(userId, depth){
    //フォローしているユーザの情報を取得
    $.ajax({
        url:'https://qiita.com/api/v2/users/' + userId + '/followees',
        success: function(data){
            var nodes_length = nodes.length;
            var userArray = [];
            $.each(data,function(index,val){
                // ノードとエッジに情報を追加
                var followeeId = val.id;
                if(!(followeeId in nodeIdMap)){
                    //ノードのIDを発行
                    nodeIdMap.followeeId = nodeIdNumber;
                    nodeIdNumber++;
                    // ネットワーク拡大用のキューに追加
                    userArray.push(followeeId);
                }
                nodes.add({id: nodeIdMap.followeeId, label:followeeId, shape:'image', image:val.profile_image_url});
                edges.add({from: nodeIdMap.userId, to: nodeIdMap.followeeId, arrows: 'to'});
            });
            network.redraw();
            if(nodeIdNumber < 100){
                expandNetwork(userArray,depth);
            }
        },
        error: function(){
            alert("フォローしているユーザの取得中にエラーが発生しました");
        }
    });

}

// depth: 入力されたユーザからのネットワークの深さの数値
function expandNetwork(userArray, depth){
    if(depth > 1) return;
    //if(nodeIdNumber > 5) return; // 終了条件
    userArray.forEach(function(userId){
        //getFollowerInfo(userId, depth+1);
        getFolloweeInfo(userId, depth+1);
    });
}

function createUserNetwork(){
    var userId = input_form.textbox.value;
    nodes = new vis.DataSet();
    edges = new vis.DataSet();
    nodeIdNumber = 0;
    nodeIdMap = new Object;
    // ネットワークのグラフを表示する要素の取得
    var container = document.getElementById('followers');
    var options = {
        nodes:{
            shape: 'image'
        }
    };
    network = new vis.Network(container,{nodes: nodes, edges: edges},options);
    //自分のユーザ情報を取得
    $.ajax({
        url:'https://qiita.com/api/v2/users/' + userId,
        success: function(data){
            //自分をノードとして追加
            if(!(userId in nodeIdMap)){
                //ノードのIDを発行
                nodeIdMap.userId = nodeIdNumber;
                nodeIdNumber++;
            }
            nodes.add({id:nodeIdMap.userId, label:userId, shape:'image', image:data.profile_image_url});
            expandNetwork([userId],0);
            // getFollowerInfo(userId);
            // getFolloweeInfo(userId);
        },
        error: function(){
            alert("指定されたユーザは存在しません");
        }
    });

}
