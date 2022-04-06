from scripts.helpful_scripts import get_account
from brownie import NFTMarketplace, config, network


def deploy_nft():
    account = get_account()

    publish_source = config["networks"][network.show_active()]["verify"]

    print('deploying NFT contract ...')
    nft = NFTMarketplace.deploy(
        "MarketPlace",
        "MP",
        {"from": account},
        publish_source=publish_source
    )

    print(f'nft is deployed at {nft.address}')


def main():
    deploy_nft()
