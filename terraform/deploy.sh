gcloud init
#auth
gcloud auth login
# set project and region 
gcloud config set project testing-id
gcloud config set compute/region us-central1
# set credentials environment
gcloud auth application-default login
terraform init
terraform apply